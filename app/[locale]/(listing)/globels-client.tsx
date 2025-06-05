"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useLayoutTheme } from "@/components/context";
import { Categories, Paginate, Tags } from "@/components/filters";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty } from "@/lib/utils";
import { totalPages } from "@/lib/paginate";
import { ListingClient } from "./listing-client";
import { HomeTwoLayout, useHomeTwoLogic } from "@/components/home-two";
import { useStickyState } from "@/hooks/use-sticky-state";

// Types
interface GlobalListingProps {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
}

interface SortedData {
  sortedTags: Tag[];
  sortedCategories: Category[];
}

// Constants
const STICKY_CONFIG = {
  threshold: 0,
  rootMargin: "-20px 0px 0px 0px",
  debug: false,
} as const;

const THEME_COLORS = {
  light: "#ffffff",
  dark: "#111827",
  transparent: "transparent",
} as const;

const STICKY_CONTAINER_ID = "sticky-tags-container";

// Custom hooks
function useSortedData(categories: Category[], tags: Tag[]): SortedData {
  return useMemo(() => ({
    sortedTags: sortByNumericProperty(tags),
    sortedCategories: sortByNumericProperty(categories),
  }), [categories, tags]);
}

function useStickyBackground(isSticky: boolean) {
  const updateBackground = useCallback((backgroundColor: string) => {
    if (typeof window === "undefined") return;
    
    const container = document.getElementById(STICKY_CONTAINER_ID);
    if (container) {
      container.style.backgroundColor = backgroundColor;
    }
  }, []);

  useEffect(() => {
    if (isSticky) {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const backgroundColor = isDarkMode ? THEME_COLORS.dark : THEME_COLORS.light;
      updateBackground(backgroundColor);
    } else {
      updateBackground(THEME_COLORS.transparent);
    }
  }, [isSticky, updateBackground]);
}

function useHomeTwoData(props: GlobalListingProps) {
  return useHomeTwoLogic(props);
}

// Layout Components
function HomeOneLayout({ 
  props, 
  sortedData, 
  isSticky, 
  sentinelRef, 
  targetRef 
}: {
  props: GlobalListingProps;
  sortedData: SortedData;
  isSticky: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  targetRef: React.RefObject<HTMLDivElement | null>;
}) {
  const stickyClasses = useMemo(() => 
    isSticky
      ? "bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 mb-4"
      : "bg-transparent p-0",
    [isSticky]
  );

  const totalPagesCount = useMemo(() => 
    totalPages(props.items.length), 
    [props.items.length]
  );

  return (
    <div className="px-4 pb-12">
      <div className="flex flex-col md:flex-row w-full gap-5">
        {/* Sidebar */}
        <aside className="md:sticky md:top-4 md:self-start">
          <Categories 
            total={props.total} 
            categories={sortedData.sortedCategories} 
          />
        </aside>

        {/* Main Content */}
        <main className="w-full">
          {/* Sentinel for sticky detection */}
          <div ref={sentinelRef} className="md:h-4 md:w-full" />
          
          {/* Sticky Tags Container */}
          <div
            ref={targetRef}
            className={`md:sticky md:top-4 z-10 transition-all duration-300 ${stickyClasses}`}
            id={STICKY_CONTAINER_ID}
          >
            <Tags tags={sortedData.sortedTags} />
          </div>

          {/* Listing */}
          <ListingClient {...props} />

          {/* Pagination */}
          <footer className="flex items-center justify-center">
            <Paginate
              basePath={props.basePath}
              initialPage={props.page}
              total={totalPagesCount}
            />
          </footer>
        </main>
      </div>
    </div>
  );
}

function HomeTwoLayoutWrapper({ 
  props, 
  sortedData, 
  homeTwoData 
}: {
  props: GlobalListingProps;
  sortedData: SortedData;
  homeTwoData: ReturnType<typeof useHomeTwoLogic>;
}) {
  return (
    <HomeTwoLayout
      {...props}
      categories={sortedData.sortedCategories}
      tags={sortedData.sortedTags}
      filteredAndSortedItems={homeTwoData.items}
      paginatedItems={homeTwoData.paginatedItems}
    />
  );
}

// Main Component
export default function GlobalListingClient(props: GlobalListingProps) {
  const { layoutHome } = useLayoutTheme();
  
  // Custom hooks
  const sortedData = useSortedData(props.categories, props.tags);
  const stickyState = useStickyState(STICKY_CONFIG);
  const homeTwoData = useHomeTwoData(props);
  
  // Side effects
  useStickyBackground(stickyState.isSticky);

  // Layout rendering logic
  const renderLayout = useCallback(() => {
    switch (layoutHome) {
      case "Home_1":
        return (
          <HomeOneLayout
            props={props}
            sortedData={sortedData}
            isSticky={stickyState.isSticky}
            sentinelRef={stickyState.sentinelRef}
            targetRef={stickyState.targetRef}
          />
        );
      
      case "Home_2":
      default:
        return (
          <HomeTwoLayoutWrapper
            props={props}
            sortedData={sortedData}
            homeTwoData={homeTwoData}
          />
        );
    }
  }, [layoutHome, props, sortedData, stickyState, homeTwoData]);

  return renderLayout();
}
