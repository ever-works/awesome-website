"use client";

import { ReactNode } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useContainerWidth } from "@/components/ui/container";

interface LayoutMasonryProps {
  children: ReactNode;
}

// Fixed width configuration
const MASONRY_CONFIG_FIXED = {
  columnsCountBreakPoints: {
    320: 1,
    480: 1,  
    640: 2,  
    768: 2,  
    1024: 3,
  },
  gutterBreakPoints: {
    320: "12px",
    640: "12px",
    768: "16px",
    1024: "16px",
  },
};

// Fluid width configuration (more columns for wider screens)
const MASONRY_CONFIG_FLUID = {
  columnsCountBreakPoints: {
    320: 1,
    480: 1,  
    640: 2,  
    768: 2,  
    1024: 3,
    1280: 4,
    1536: 5,
    1920: 6,
  },
  gutterBreakPoints: {
    320: "12px",
    640: "12px",
    768: "16px",
    1024: "16px",
    1280: "16px",
    1536: "16px",
    1920: "16px",
  },
};

export default function LayoutMasonry({ children }: LayoutMasonryProps) {
  const containerWidth = useContainerWidth();
  const config = containerWidth === "fluid" ? MASONRY_CONFIG_FLUID : MASONRY_CONFIG_FIXED;

  return (
    <ResponsiveMasonry 
      columnsCountBreakPoints={config.columnsCountBreakPoints}
      gutterBreakPoints={config.gutterBreakPoints}
    >
      <Masonry>{children}</Masonry>
    </ResponsiveMasonry>
  );
}
