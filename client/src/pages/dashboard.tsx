import { useQuery } from "@tanstack/react-query";
import StatsOverview from "@/components/stats-overview";
import ImportPanel from "@/components/import-panel";
import ProgressTracker from "@/components/progress-tracker";
import HistoryTable from "@/components/history-table";
import SidePanel from "@/components/side-panel";
import { Database, Settings, Wifi } from "lucide-react";

export default function Dashboard() {
  const { data: apiStatus } = useQuery({
    queryKey: ["/api/status"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Accurate Import Manager</h1>
                <p className="text-sm text-gray-500">Business Transaction Import Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus?.connected ? 'bg-success' : 'bg-error'}`} />
                <span className="text-sm text-gray-600">
                  {apiStatus?.connected ? "API Connected" : "API Disconnected"}
                </span>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Import Panel */}
          <div className="lg:col-span-2 space-y-6">
            <ImportPanel />
            <ProgressTracker />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <SidePanel />
          </div>
        </div>

        {/* Import History Table */}
        <div className="mt-8">
          <HistoryTable />
        </div>
      </div>
    </div>
  );
}
