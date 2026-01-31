import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface BasicTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowsPerPage?: number;
  loading?: boolean;
  meta?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  } | null;
  onPageChange?: (newPage: number) => void;
}

export default function DParcelTable<T extends { id: number }>({
  columns,
  data,
  rowsPerPage,
  loading,
}: BasicTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  // If no pagination is needed
  if (!rowsPerPage) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full">
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    isHeader
                    className={`px-4 py-3 font-medium text-gray-500 text-start text-xs whitespace-nowrap dark:text-gray-400 ${col.className || ""}`}
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {data.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No records found
                  </td>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((col) => (
                      <TableCell
                        key={String(col.key)}
                        className={`px-4 py-3 text-gray-700 text-start text-sm align-top dark:text-gray-400 ${col.className || ""}`}
                      >
                        <div className="max-w-xs break-words">
                          {col.render ? col.render(row) : (row as any)[col.key]}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // ✅ If pagination is enabled
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  isHeader
                  className={`px-4 py-3 font-medium text-gray-500 text-start text-xs whitespace-nowrap dark:text-gray-400 ${col.className || ""}`}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05] relative">
            {loading ? (
              <TableRow>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400 relative"
                >
                  {/* Loader Spinner */}
                  <div className="flex justify-center items-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-3">Loading data...</p>
                </td>
              </TableRow>
            ) : currentData.length === 0 ? (
              <TableRow>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No records found
                </td>
              </TableRow>
            ) : (
              currentData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`px-4 py-3 text-gray-700 text-start text-sm align-top dark:text-gray-400 ${col.className || ""}`}
                    >
                      <div className="max-w-xs break-words">
                        {col.render ? col.render(row) : (row as any)[col.key]}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {data.length > rowsPerPage && (
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}