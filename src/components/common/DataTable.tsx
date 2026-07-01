/**
 * DataTable Component
 * Enterprise-grade data table with sorting, filtering, pagination, and bulk actions
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Search, Download, Trash2,
  MoreHorizontal, Check
} from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { Skeleton } from '@/components/loaders/Skeleton';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchKeys?: string[];
  selectable?: boolean;
  onSelect?: (selected: T[]) => void;
  onDelete?: (ids: (string | number)[]) => void;
  onExport?: () => void;
  pageSize?: number;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchKeys = [],
  selectable = false,
  onSelect,
  onDelete,
  onExport,
  pageSize = 10,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Search
    if (search && searchKeys.length > 0) {
      const query = search.toLowerCase();
      result = result.filter(item =>
        searchKeys.some(key => {
          const value = (item as any)[key];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as any)[sortKey];
        const bVal = (b as any)[sortKey];
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, searchKeys, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Handlers
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const handleSelectAll = useCallback(() => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginatedData.map(item => item.id)));
    }
  }, [paginatedData, selected.size]);

  const handleSelectItem = useCallback((id: string | number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (onDelete && selected.size > 0) {
      onDelete(Array.from(selected));
      setSelected(new Set());
    }
  }, [onDelete, selected]);

  // Reset page when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-3">
          {searchable && (
            <div className="w-64">
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                icon={<Search size={16} />}
                size="sm"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectable && selected.size > 0 && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selected.size} selected
              </span>
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  icon={<Trash2 size={14} />}
                >
                  Delete
                </Button>
              )}
            </>
          )}
          {onExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExport}
              icon={<Download size={14} />}
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <button
                    onClick={handleSelectAll}
                    className={cn(
                      'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                      selected.size === paginatedData.length && paginatedData.length > 0
                        ? 'bg-[#6b5fff] border-[#6b5fff] text-white'
                        : 'border-gray-300 dark:border-gray-600 hover:border-[#6b5fff]'
                    )}
                    aria-label="Select all"
                  >
                    {selected.size === paginatedData.length && paginatedData.length > 0 && (
                      <Check size={12} />
                    )}
                  </button>
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={cn('flex items-center gap-1', col.align === 'right' && 'justify-end')}>
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {selectable && <td className="px-4 py-3"><Skeleton className="w-5 h-5" /></td>}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    selected.has(item.id) && 'bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSelectItem(item.id)}
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                          selected.has(item.id)
                            ? 'bg-[#6b5fff] border-[#6b5fff] text-white'
                            : 'border-gray-300 dark:border-gray-600 hover:border-[#6b5fff]'
                        )}
                        aria-label={`Select row ${item.id}`}
                      >
                        {selected.has(item.id) && <Check size={12} />}
                      </button>
                    </td>
                  )}
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-gray-700 dark:text-gray-300',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, processedData.length)} of{' '}
            {processedData.length} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="min-w-[36px]"
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
