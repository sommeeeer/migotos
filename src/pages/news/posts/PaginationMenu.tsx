import {
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Pagination,
} from "~/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  postsPerPage: number;
}

export default function PaginationMenu({
  currentPage,
  totalPages,
  postsPerPage = 5,
}: PaginationProps) {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPages / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  pageNumbers.push(totalPages);
  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href={
                currentPage - 1 <= 1
                  ? "/news/posts/"
                  : `/news/posts/${currentPage - 1}`
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
                href={number === 1 ? "/news/posts/" : `/news/posts/${number}`}
                isActive={currentPage === number}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={`/news/posts/${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
