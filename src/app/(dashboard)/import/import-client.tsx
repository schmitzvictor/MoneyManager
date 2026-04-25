'use client';

import { useState } from 'react';
import { ImportDropzone } from '@/components/import/import-dropzone';
import { ImportPreviewTable } from '@/components/import/import-preview-table';
import { ParsedTransaction } from '@/lib/import';

interface ImportClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
}

export function ImportClient({ accounts }: ImportClientProps) {
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
        onCancel={() => setParsedData(null)}
      />
    );
  }

  return (
    <ImportDropzone
      accounts={accounts}
      onParsed={(accountId, filename, format, transactions) => {
        setParsedData({ accountId, filename, format, transactions });
      }}
    />
  );
}
