'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    label: string;
    width?: string;
    render?: (item: T) => React.ReactNode;
  }[];
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  estimateSize?: number;
  overscan?: number;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onLoadMore,
  isLoading,
  hasMore,
  estimateSize = 50,
  overscan = 5,
}: DataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView();

  // Trigger load more when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, onLoadMore]);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b sticky top-0 z-10">
        <div className="grid" style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}>
          {columns.map((column) => (
            <div key={column.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Scrolling Container */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: '600px' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualItem) => {
            const item = data[virtualItem.index];
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div 
                  className="grid border-b hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: columns.map(c => c.width || '1fr').join(' ') }}
                >
                  {columns.map((column) => (
                    <div key={column.key} className="px-4 py-3 text-sm">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Trigger */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center p-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}