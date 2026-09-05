import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface PaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-2 px-[18px] py-3.5 text-[13px] text-muted">
      <span>
        {start} a {end} de {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1.5 text-xs"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Anterior
        </Button>
        <span className="font-mono text-xs">
          {page} / {pageCount}
        </span>
        <Button
          type="button"
          variant="secondary"
          className="!px-3 !py-1.5 text-xs"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          Próxima
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
