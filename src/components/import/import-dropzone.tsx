'use client';

import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseCSV, parseOFX, ParsedTransaction } from '@/lib/import';

interface ImportDropzoneProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[];
  onParsed: (accountId: string, filename: string, format: 'csv' | 'ofx', data: ParsedTransaction[]) => void;
}

export function ImportDropzone({ accounts, onParsed }: ImportDropzoneProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!selectedAccount) {
      setError('Please select an account first.');
      return;
    }
    setError(null);
    setIsParsing(true);

    try {
      const isOFX = file.name.toLowerCase().endsWith('.ofx');
      const isCSV = file.name.toLowerCase().endsWith('.csv');

      if (!isOFX && !isCSV) {
        throw new Error('Please upload a valid .csv or .ofx file.');
      }

      const parsedData = isCSV ? await parseCSV(file) : await parseOFX(file);
      
      if (parsedData.length === 0) {
        throw new Error('No valid transactions found in the file.');
      }

      onParsed(selectedAccount, file.name, isCSV ? 'csv' : 'ofx', parsedData);
    } catch (err: any) {
      setError(err.message || 'Failed to parse file.');
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <label className="text-sm font-medium">1. Select Account</label>
        <Select value={selectedAccount} onValueChange={(v) => { if (v) setSelectedAccount(v); setError(null); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select the account to import into..." />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name} ({a.type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">2. Upload File (.csv or .ofx)</label>
        <div
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
            ${!selectedAccount ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={selectedAccount ? onDragOver : undefined}
          onDragLeave={selectedAccount ? onDragLeave : undefined}
          onDrop={selectedAccount ? onDrop : undefined}
          onClick={() => selectedAccount && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv,.ofx"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">Bank statements in CSV or OFX format</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-600 rounded-lg text-sm border border-red-500/20">
          {error}
        </div>
      )}

      {isParsing && (
        <div className="text-center text-sm text-muted-foreground animate-pulse">
          Parsing file...
        </div>
      )}
    </div>
  );
}
