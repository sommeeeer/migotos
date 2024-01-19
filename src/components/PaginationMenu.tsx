import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination,
} from "~/components/ui/pagination";
import { cn } from "~/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export default function PaginationMenu({
  currentPage,
  totalPages,
  className,
}: PaginationProps) {
  const pageNumbers: (number | string)[] = [];
  const leftEllipsis = currentPage > 2;
  const rightEllipsis = currentPage < totalPages - 1;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pageNumbers.push(i);
    }
  }

  if (leftEllipsis) {
    pageNumbers.splice(1, 0, "...");
  }

  if (rightEllipsis) {
    pageNumbers.splice(pageNumbers.length - 1, 0, "...");
  }

  return (
    <Pagination className={cn(className)}>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              rel="prev"
              href={
                currentPage - 1 <= 1
                  ? "/news/"
                  : `/news/page/${currentPage - 1}`
              }
            />
          </PaginationItem>
        )}
        {pageNumbers.map((number, index) =>
          typeof number === "string" ? (
            <PaginationEllipsis key={index} title="More pages" />
          ) : (
            <PaginationItem key={index}>
              <PaginationLink
                href={number === 1 ? "/news/" : `/news/page/${number}`}
                isActive={currentPage === number}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        {currentPage < totalPages - 1 && (
          <PaginationItem>
            <PaginationNext rel="next" href={`/news/page/${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
