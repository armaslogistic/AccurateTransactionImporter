import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Info } from "lucide-react";

export default function ProgressTracker() {
  const { data: imports } = useQuery({
    queryKey: ["/api/imports"],
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const activeImport = imports?.find((job: any) => job.status === 'processing');

  if (!activeImport) {
    return null;
  }

  const progress = activeImport.totalRecords > 0 
    ? Math.round((activeImport.processedRecords / activeImport.totalRecords) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckSquare className="h-5 w-5 text-primary mr-3" />
          Import Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {activeImport.type === 'warehouse' ? 'Warehouse' : 'Sales Invoice'} Import - {activeImport.fileName}
              </span>
              <span className="text-sm text-gray-500">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold text-gray-900">{activeImport.processedRecords}</p>
              <p className="text-sm text-gray-500">Processed</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-success">{activeImport.successfulRecords}</p>
              <p className="text-sm text-gray-500">Success</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-error">{activeImport.failedRecords}</p>
              <p className="text-sm text-gray-500">Errors</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 flex items-center">
              <Info className="h-4 w-4 text-blue-500 mr-2" />
              Processing row {activeImport.processedRecords + 1} of {activeImport.totalRecords}...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
