"use client";
import { useState, useMemo, useRef, Suspense, useEffect, useCallback } from "react";
import { Tag } from "@/lib/content";
import { TagsCards } from "@/components/tags-cards";
import UniversalPagination from "@/components/universal-pagination";
import Hero from "@/components/hero";
import { useTranslations } from "next-intl";
import { useLayoutTheme } from "@/components/context";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useInfiniteLoading } from "@/hooks/use-infinite-loading";
import { GridSkeleton } from "@/components/ui/skeleton";

/**
 * Hook to calculate optimal items per page based on viewport height
 * Ensures pagination stays visible without scrolling
 */
function useResponsiveItemsPerPage(defaultItemsPerPage: number) {
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const calculateItemsPerPage = useCallback(() => {
    if (typeof window === 'undefined') return defaultItemsPerPage;

    const viewportHeight = window.innerHeight;
    // Estimate space taken by header, hero section, and pagination
    // Hero header ~200px, pagination ~80px, margins ~100px
    const reservedHeight = 380;
    const availableHeight = viewportHeight - reservedHeight;
    
    // Card height estimate: ~90px in compact mode (with gap)
    const cardHeight = 90;
    // Get number of columns based on viewport width
    const viewportWidth = window.innerWidth;
    let columns = 1;
    if (viewportWidth >= 1280) columns = 4; // xl
    else if (viewportWidth >= 1024) columns = 3; // lg
    else if (viewportWidth >= 640) columns = 2; // sm
    
    // Calculate rows that fit
    const rowsThatFit = Math.max(2, Math.floor(availableHeight / cardHeight));
    const calculatedItems = rowsThatFit * columns;
    
    // Return calculated items, minimum 8, maximum 40
    return Math.min(40, Math.max(8, calculatedItems));
  }, [defaultItemsPerPage]);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    // Calculate on mount
    handleResize();

    // Recalculate on resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateItemsPerPage]);

  return itemsPerPage;
}

function TagsGridContent({ tags }: { tags: Tag[] }) {
  const t = useTranslations("listing");
  const tCommon = useTranslations("common");
  const tGrid = useTranslations("admin.TAGS_GRID_CLIENT");
  const { paginationType, itemsPerPage: defaultItemsPerPage } = useLayoutTheme();
  const [page, setPage] = useState(1);
  
  // Use responsive items per page for standard pagination
  const responsiveItemsPerPage = useResponsiveItemsPerPage(defaultItemsPerPage);
  const itemsPerPage = paginationType === "standard" ? responsiveItemsPerPage : defaultItemsPerPage;

  const {
    displayedItems: loadedTags,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = useInfiniteLoading({ items: tags, initialPage: 1, perPage: defaultItemsPerPage });

  // Calculate total pages for pagination
  const totalPages = Math.ceil(tags.length / itemsPerPage);

  const pagedTags = useMemo(() => tags.slice((page - 1) * itemsPerPage, page * itemsPerPage), [tags, page, itemsPerPage]);
  
  // Reset to page 1 if current page exceeds total pages (can happen on resize)
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);
  const tagsToShow = paginationType === "infinite" ? loadedTags : pagedTags;

  // Move hooks above early return to avoid conditional hook call
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && !isLoading && hasMore && paginationType === "infinite" && loadedTags.length > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          loadMore();
        }, 150); // 150ms debounce
      }
    },
    threshold: 0.5,
    rootMargin: "100px",
  });

  // Handle empty state
  if (tags.length === 0) {
    return (
      <Hero badgeText={t("TAGS")} title={t("TAGS")} description={tCommon("TAGS_DESCRIPTION")}>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {tGrid("NO_TAGS_FOUND")}
          </p>
        </div>
      </Hero>
    );
  }

  // Sync page state for standard pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <Hero
      badgeText={t("TAGS")}
      title={
        <span className="bg-linear-to-r from-theme-primary via-purple-500 to-theme-primary bg-clip-text text-transparent">
          {t("TAGS", { defaultValue: "Tags" })}
        </span>
      }
      description={tCommon("TAGS_DESCRIPTION", {
        defaultValue: "Browse all tags in our directory."
      })}
      className="min-h-screen text-center flex flex-col"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex-1">
        <TagsCards tags={tagsToShow} compact />
      </div>
      {/* Standard Pagination - sticky at bottom */}
      {paginationType === "standard" && (
        <footer className="flex items-center justify-center py-6 mt-auto sticky bottom-0 bg-gradient-to-t from-white via-white dark:from-gray-900 dark:via-gray-900 to-transparent">
          <UniversalPagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </footer>
      )}
      {/* Infinite Scroll Loader */}
      {paginationType === "infinite" && (
        <div className="flex flex-col items-center gap-6 mt-16 mb-12">
          {hasMore && (
            <div ref={loadMoreRef} className="w-full flex items-center justify-center py-8">
              {error ? (
                <div className="text-center py-4">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                    {tGrid("FAILED_TO_LOAD_MORE_TAGS")}
                  </p>
                  <button 
                    onClick={() => loadMore()} 
                    className="text-sm text-theme-primary-500 dark:text-theme-primary-400 hover:text-theme-primary-700 dark:hover:text-theme-primary-300 transition-colors focus:outline-hidden focus:ring-2 focus:ring-theme-primary-500 rounded-sm px-2 py-1"
                  >
                    {tGrid("RETRY")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-theme-primary-500 dark:text-theme-primary-400">
                  {isLoading && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">{tGrid("LOADING")}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          {!hasMore && !error && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{tGrid("REACHED_THE_END")}</p>
            </div>
          )}
        </div>
      )}
    </Hero>
  );
}

export default function TagsGridClient({ tags }: { tags: Tag[] }) {
  return (
    <Suspense fallback={<GridSkeleton count={12} />}>
      <TagsGridContent tags={tags} />
    </Suspense>
  );
}