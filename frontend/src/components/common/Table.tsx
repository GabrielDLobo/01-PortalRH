import React from 'react';
import clsx from 'clsx';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  width?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  sortConfig,
  onSort,
  isLoading = false,
  emptyMessage = 'No data available',
  className,
  rowClassName,
  onRowClick,
}: TableProps<T>) => {
  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronUpIcon className="h-4 w-4 text-neutral-300" />;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 text-primary-500" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 text-primary-500" />
    );
  };

  const renderCellContent = (column: Column<T>, item: T) => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = item[column.key];
    return value !== null && value !== undefined ? String(value) : '-';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={clsx('overflow-hidden bg-white shadow-soft rounded-xl', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-neutral-100',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-neutral-200">
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={clsx(
                    'hover:bg-neutral-50 transition-colors duration-150',
                    onRowClick && 'cursor-pointer',
                    rowClassName && rowClassName(item, index)
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={clsx(
                        'px-6 py-4 whitespace-nowrap text-sm text-neutral-900',
                        column.className
                      )}
                    >
                      {renderCellContent(column, item)}
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
};

export default Table;