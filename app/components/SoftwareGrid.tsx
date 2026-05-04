import type { Software } from "~/lib/software";
import SoftwareCard, { type ViewMode } from "./SoftwareCard";

interface SoftwareGridProps {
  software: Software[];
  viewMode?: ViewMode;
}

export default function SoftwareGrid({
  software,
  viewMode = "cards",
}: SoftwareGridProps) {
  const containerClass =
    viewMode === "rectangles"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return (
    <div className={containerClass}>
      {software.map((item) => (
        <SoftwareCard
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          categoryDisplayName={item.categoryDisplayName}
          country={item.country}
          website={item.website}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
