import { ReactNode } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

interface LayoutMasonryProps {
  children: ReactNode;
}

export default function LayoutMasonry({ children }: LayoutMasonryProps) {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 
        350: 1, 
        750: 2, 
        900: 3,
      }}
      gutterBreakpoints={{
        350: "16px",
        640: "20px",
        1024: "24px",
      }}
      className="w-full mx-auto"
    >
      <Masonry>{children}</Masonry>
    </ResponsiveMasonry>
  );
}
