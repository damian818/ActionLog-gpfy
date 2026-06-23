/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ActionItem, Customer } from '../types';

interface ExcelManagerProps {
  customers: Customer[];
  actions: ActionItem[];
  currentUser: any;
  onRefresh: () => void;
  selectedCustomerId: string;
}

export default function ExcelManager({
  customers,
  actions,
  currentUser,
  onRefresh,
  selectedCustomerId
}: ExcelManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        setFile(droppedFile);
        setMessage(null);
      } else {
        setMessage({ text: 'Please upload only Excel files (.xlsx or .xls)', type: 'error' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleExport = () => {
    try {
      // Filter actions if selected customer is specific
      const exportData = actions
        .filter(a => !selectedCustomerId || a.customerId === selectedCustomerId)
        .map(a => {
          const clientName = customers.find(c => c.id === a.customerId)?.name || a.customerId;
          return {
            ID: a.id,
            'Client Tenant ID': a.customerId,
            'Client Name': clientName,
            Title: a.title,
            Description: a.description,
            Status: a.status,
            Priority: a.priority,
            'Owner Name': a.ownerName,
            'Owner Email': a.ownerEmail,
            Deadline: a.deadline,
            'Jira Ticket / Link': a.jiraLink || '',
            'Created At': a.createdAt,
            'Last Updated': a.updatedAt
          };
        });

      if (exportData.length === 0) {
        setMessage({ text: 'No action items to export matching current filter context.', type: 'info' });
        return;
      }

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Action Log');
      
      const fileName = selectedCustomerId 
        ? `Gappify_Action_Log_${selectedCustomerId.toUpperCase()}_${new Date().toISOString().slice(0,10)}.xlsx`
        : `Gappify_Master_Action_Log_${new Date().toISOString().slice(0,10)}.xlsx`;

      XLSX.writeFile(wb, fileName);
      setMessage({ text: `Successfully exported ${exportData.length} records into ${fileName}`, type: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ text: 'Failed to generate spreadsheet file. Try again.', type: 'error' });
    }
  };

  const handleImport = () => {
    if (!file) return;

    setImporting(true);
    setMessage({ text: 'Reading spreadsheet...', type: 'info' });

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rows.length === 0) {
          setMessage({ text: 'Excel spreadsheet is empty.', type: 'error' });
          setImporting(false);
          return;
        }

        // Map columns from Excel to Action Schema keys
        const formattedRows = rows.map(r => {
          return {
            id: r['ID'] || r['id'] || undefined,
            customerId: r['Client Tenant ID'] || r['customerId'] || selectedCustomerId || (currentUser.customerId || ''),
            title: r['Title'] || r['title'] || '',
            description: r['Description'] || r['description'] || '',
            status: r['Status'] || r['status'] || 'not_started',
            priority: r['Priority'] || r['priority'] || 'Medium',
            ownerName: r['Owner Name'] || r['ownerName'] || '',
            ownerEmail: r['Owner Email'] || r['ownerEmail'] || '',
            deadline: r['Deadline'] || r['deadline'] || new Date().toISOString().slice(0, 10),
            jiraLink: r['Jira Ticket / Link'] || r['jiraLink'] || ''
          };
        });

        // POST JSON block to API
        const response = await fetch('/api/actions/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: formattedRows })
        });

        const result = await response.json();
        if (response.ok) {
          setMessage({ 
            text: `Import complete. Created ${result.created} new actions and updated ${result.updated} existing actions.`, 
            type: 'success' 
          });
          setFile(null);
          onRefresh();
        } else {
          setMessage({ text: result.error || 'Server rejected imported data rows.', type: 'error' });
        }
      } catch (error) {
        console.error('Import process error:', error);
        setMessage({ text: 'Failed parsing Excel. Please verify sheet formats.', type: 'error' });
      } finally {
        setImporting(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        ID: 'GAP-101',
        'Client Tenant ID': 'acme',
        Title: 'Configure Gappify ERP Integration API',
        Description: 'Establish secure OAuth credentials and set up the REST mapping endpoints.',
        Status: 'in_progress',
        Priority: 'High',
        'Owner Name': 'Jane Acme',
        'Owner Email': 'jane@acme.com',
        Deadline: '2026-07-15',
        'Jira Ticket / Link': 'https://jira.gappify.com/browse/GAP-120'
      },
      {
        ID: '',
        'Client Tenant ID': 'globex',
        Title: 'Provide standard ledger mappings',
        Description: 'Set up custom fields mapping file.',
        Status: 'not_started',
        Priority: 'Medium',
        'Owner Name': 'Bob Globex',
        'Owner Email': 'bob@globex.com',
        Deadline: '2026-07-30',
        'Jira Ticket / Link': ''
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Gappify_Action_Import_Template.xlsx');
  };

  return (
    <div id="excel-manager" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Mass Action Import & Export</h2>
          <p className="text-sm text-gray-500 mt-1">
            Bulk-upload actions using standard spreadsheets, or export current filter sets for client review.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="mt-3 sm:mt-0 inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Download Excel Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Column */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-800">1. Bulk Upload / Update Spreadsheet</h3>
          
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              file 
                ? 'border-emerald-300 bg-emerald-50/20' 
                : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'
            }`}
          >
            <input
              type="file"
              id="excel-file-upload"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={currentUser.role === 'customer_user'}
            />
            
            <label 
              htmlFor={currentUser.role === 'customer_user' ? undefined : 'excel-file-upload'}
              className={`flex flex-col items-center justify-center gap-3 ${
                currentUser.role === 'customer_user' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <div className={`p-3 rounded-full ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {file ? file.name : 'Choose file or drag here'}
                </span>
                <span className="block text-xs text-gray-400 mt-1">
                  Supports .xlsx and .xls formats
                </span>
              </div>
            </label>
          </div>

          {file && (
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {importing ? 'Processing Sheet...' : 'Execute Excel Upload'}
              </button>
              <button
                onClick={() => setFile(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Export Column */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">2. Structured Data Extraction</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Export all action items currently listed under Gappify Implementations.
              Exports respect active role filters and multi-tenancy rules to secure database segment scopes automatically.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2.5 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Role Security:</span>
                Client users are locked to their respective tenant rows only. Team admins receive global sheets.
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="w-full mt-4 inline-flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm px-5 py-3 rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Actions to Excel
          </button>
        </div>
      </div>

      {/* Message Toaster */}
      {message && (
        <div className={`p-4 rounded-lg border flex gap-3 text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : message.type === 'error'
            ? 'bg-rose-50 border-rose-100 text-rose-800'
            : 'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          ) : (
            <Info className="w-5 h-5 shrink-0 text-blue-600" />
          )}
          <div>
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
