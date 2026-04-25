'use client';

import { useState } from 'react';
import { ImportDropzone } from '@/components/import/import-dropzone';
import { ImportPreviewTable } from '@/components/import/import-preview-table';
import { ParsedTransaction } from '@/lib/import';

import { applyRulesBulk } from '@/lib/rules/engine';

interface ImportClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: any[];
}

export function ImportClient({ accounts, categories, rules }: ImportClientProps) {
  const [parsedData, setParsedData] = useState<{
    accountId: string;
    filename: string;
    format: 'csv' | 'ofx';
    transactions: ParsedTransaction[];
  } | null>(null);

  if (parsedData) {
    return (
      <ImportPreviewTable
        accountId={parsedData.accountId}
        filename={parsedData.filename}
        format={parsedData.format}
        data={parsedData.transactions}
        categories={categories}
        onCancel={() => setParsedData(null)}
      />
    );
  }

  return (
    <ImportDropzone
      accounts={accounts}
      onParsed={(accountId, filename, format, transactions) => {
        // Apply rules to auto-categorize
        const categorized = applyRulesBulk(transactions, rules);
        setParsedData({ accountId, filename, format, transactions: categorized as ParsedTransaction[] });
      }}
    />
  );
}
