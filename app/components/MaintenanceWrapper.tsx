import { useState, useEffect } from "react";

// Maintenance page component
function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-euBlue to-blue-800 text-white">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6">Maintenance in Progress</h1>
        <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm mb-8">
          <p className="text-xl mb-4">
            We&apos;re currently upgrading our systems to serve you better.
          </p>
          <p className="mb-4">
            The EuroMakers platform is temporarily unavailable while we make
            some improvements. This maintenance is planned and we expect to be
            back online soon.
          </p>
          <p>Thank you for your patience and understanding.</p>
        </div>

        <div className="animate-pulse flex justify-center space-x-3 text-sm opacity-70">
          <div className="h-2 w-2 bg-white rounded-full"></div>
          <div className="h-2 w-2 bg-white rounded-full animation-delay-200"></div>
          <div className="h-2 w-2 bg-white rounded-full animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
}

// MaintenanceWrapper component
export default function MaintenanceWrapper({
  children,
  isMaintenanceMode,
}: {
  children: React.ReactNode;
  isMaintenanceMode: boolean;
}) {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // Check for maintenance mode
    if (isMaintenanceMode || window.ENV?.MAINTENANCE_MODE === "true") {
      setIsMaintenance(true);
    }
  }, [isMaintenanceMode]);

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return <>{children}</>;
}
