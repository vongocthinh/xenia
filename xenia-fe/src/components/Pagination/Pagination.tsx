import { useEffect, useMemo, useState } from "react";
import './Pagination.css'

interface IPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: (pageNum: number) => void;
}

export const Pagination = ({
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: IPaginationProps) => {
  const [activePage, setActivePage] = useState(1);
  const pageRange = useMemo(() => {
    const pages = []
    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
      pages.push(i);
    }
    return pages;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPreviousPage = () => {
    if (activePage > 1) {
      setActivePage(activePage - 1)
    }
  };

  const setNextPage = () => {
    if (activePage < pageRange.length) {
      setActivePage(activePage + 1)
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setCurrentPage(activePage), [activePage]);

  if (!totalItems) return <></>;
  return (
    <div className="pagination">
        <button onClick={setPreviousPage}>
          Prev
        </button>
        {pageRange.map((number) => (
          <button
            className={`${number === activePage ? 'active' : ''}`}
            key={number}
            onClick={() => {
              console.log(number);
              setActivePage(number);
            }}
          >
            {number}
          </button>
        ))}
        <button onClick={setNextPage}>
          Next
        </button>
    </div>
  );
};
