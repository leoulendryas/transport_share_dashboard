import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, loading, onRowClick, emptyMessage = "No data found" }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
              {columns.map((column, i) => (
                <th 
                  key={i} 
                  className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded-md w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-xs text-zinc-500 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr 
                  key={i} 
                  onClick={() => onRowClick?.(item)}
                  className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50' : ''}`}
                >
                  {columns.map((column, j) => (
                    <td 
                      key={j} 
                      className={`px-6 py-4 text-xs font-medium text-zinc-900 dark:text-zinc-100 ${column.className || ''}`}
                    >
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : (item[column.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
