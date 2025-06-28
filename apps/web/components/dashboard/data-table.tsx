'use client';

import { useState, useEffect, useRef } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  actions?: React.ReactNode;
  onRowSelect?: (row: any) => void;
  enableKeyboardNavigation?: boolean;
}

export function DataTable({ 
  title, 
  columns, 
  data, 
  actions,
  onRowSelect,
  enableKeyboardNavigation = true 
}: DataTableProps) {
  const [selectedRow, setSelectedRow] = useState(-1);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedRow(prev => Math.min(prev + 1, data.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedRow(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (selectedRow >= 0 && data[selectedRow]) {
            onRowSelect?.(data[selectedRow]);
          }
          break;
      }
    };

    const table = tableRef.current;
    if (table) {
      table.addEventListener('keydown', handleKeyDown);
      return () => table.removeEventListener('keydown', handleKeyDown);
    }
  }, [data, selectedRow, onRowSelect, enableKeyboardNavigation]);

  useEffect(() => {
    // Focus the selected row
    if (selectedRow >= 0) {
      const rows = tableRef.current?.querySelectorAll('tbody tr');
      if (rows && rows[selectedRow]) {
        (rows[selectedRow] as HTMLElement).focus();
      }
    }
  }, [selectedRow]);

  return (
    <div className="data-panel">
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="data-table" ref={tableRef}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                tabIndex={0}
                className={selectedRow === index ? 'bg-blue-50' : ''}
                onClick={() => {
                  setSelectedRow(index);
                  onRowSelect?.(row);
                }}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}