import type { Software } from "~/lib/software";
import SoftwareCard from "./SoftwareCard";

interface SoftwareGridProps {
  software: Software[];
}

export default function SoftwareGrid({ software }: SoftwareGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {software.map((item) => (
        <SoftwareCard
          key={item.id}
          id={item.id}
          name={item.name}
          description={item.description}
          categoryDisplayName={item.categoryDisplayName}
          country={item.country}
          logo={item.logo}
        />
      ))}
    </div>
  );
}
