import { parse } from 'node-ofx-parser';
import { normalizeDate, normalizeDescription } from './normalize';
import { ParsedTransaction } from './csv';

export async function parseOFX(file: File): Promise<ParsedTransaction[]> {
  const text = await file.text();
  
  try {
    const ofxData = parse(text);
    return processOFX(ofxData);
  } catch (error) {
    throw new Error('Failed to parse OFX file');
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processOFX(ofxData: any): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  // OFX structure is deeply nested. We need to find STMTTRN nodes.
  // E.g. OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN
  // Or OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN
  
  let stmtTrnList: any[] = [];

  const bankStmts = ofxData?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN;
  if (bankStmts) {
    stmtTrnList = Array.isArray(bankStmts) ? bankStmts : [bankStmts];
  } else {
    const ccStmts = ofxData?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST?.STMTTRN;
    if (ccStmts) {
      stmtTrnList = Array.isArray(ccStmts) ? ccStmts : [ccStmts];
    }
  }

  stmtTrnList.forEach((trn: any, index: number) => {
    // TRNTYPE: CREDIT, DEBIT, POS, etc.
    // DTPOSTED: YYYYMMDDHHMMSS
    // TRNAMT: amount
    // MEMO or NAME: description

    const rawDate = trn.DTPOSTED ? trn.DTPOSTED.substring(0, 8) : null;
    const rawAmount = trn.TRNAMT;
    const rawDesc = trn.MEMO || trn.NAME || 'Unknown';

    if (!rawDate || !rawAmount) return;

    // Convert YYYYMMDD to YYYY-MM-DD
    const dateFormatted = `${rawDate.substring(0,4)}-${rawDate.substring(4,6)}-${rawDate.substring(6,8)}`;
    const date = normalizeDate(dateFormatted);
    const description = normalizeDescription(rawDesc);
    let amount = parseFloat(rawAmount);
    
    if (isNaN(amount) || amount === 0) return;

    const isExpense = amount < 0;
    amount = Math.abs(amount);

    if (date) {
      transactions.push({
        id: `ofx-${index}-${Date.now()}`,
        date,
        description,
        amount,
        type: isExpense ? 'expense' : 'income',
        status: 'posted',
        raw: trn,
      });
    }
  });

  return transactions;
}
