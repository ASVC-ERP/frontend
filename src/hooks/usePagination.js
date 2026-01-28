import { useState } from "react";

export const usePagination = (initialPage = 1, initialLimit = 100) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalRows, setTotalRows] = useState(0);

  return {
    page,
    setPage,
    limit,
    setLimit,
    totalRows,
    setTotalRows,
  };
};