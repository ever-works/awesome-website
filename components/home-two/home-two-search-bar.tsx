"use client";

import { useFilters } from "@/hooks/use-filters";
import { Search } from "lucide-react";

export function HomeTwoSearchBar() {
  const { searchTerm, setSearchTerm } = useFilters();

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search any product you need..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md pl-3 pr-10 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none transition-colors duration-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 min-w-96"
      />
      <div className="absolute right-0 top-0 p-1.5 pointer-events-none">
        <Search className="w-4 h-4 text-gray-400" />
      </div>
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
        >
          ×
        </button>
      )}
    </div>
  );
}
