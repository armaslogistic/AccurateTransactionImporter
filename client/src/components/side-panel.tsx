import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { History, Server, Zap, CheckCircle, Upload, AlertTriangle, Warehouse, Download, Trash2, ChevronRight, Plug } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient"; 

export default function SidePanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: imports } = useQuery({
    queryKey: ["/api/imports"],
  });

  const { data: apiStatus } = useQuery({
    queryKey: ["/api/status"],
  });

  const { data: apiLogs } = useQuery({
    queryKey: ["/api/logs"],
  });

  const syncWarehousesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/warehouses/sync');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Warehouses Synced",
        description: `${data.synced} warehouses synchronized`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync warehouses",
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/status');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.connected ? "Connection Successful" : "Connection Failed",
        description: data.connected 
          ? `Response time: ${data.responseTime}ms`
          : data.error || "Unable to connect to API",
        variant: data.connected ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/status"] });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Failed to test connection",
        variant: "destructive",
      });
    },
  });

  const recentActivities = imports?.slice(0, 3).map((job: any) => ({
    id: job.id,
    title: job.status === 'completed' ? 'Import completed' : 
           job.status === 'failed' ? 'Import failed' : 
           job.status === 'processing' ? 'Import in progress' : 'Import queued',
    description: `${job.fileName}`,
    time: job.createdAt ? formatDistanceToNow(new Date(job.createdAt), { addSuffix: true }) : '',
    icon: job.status === 'completed' ? CheckCircle : 
          job.status === 'failed' ? AlertTriangle : Upload,
    iconColor: job.status === 'completed' ? 'text-success' : 
               job.status === 'failed' ? 'text-error' : 'text-primary',
    bgColor: job.status === 'completed' ? 'bg-success/10' : 
             job.status === 'failed' ? 'bg-red-100' : 'bg-blue-100',
  })) || [];

  return (
    <div className="space-y-6">
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 text-primary mr-3" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bgColor}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description} • {activity.time}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View all activity
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 text-primary mr-3" />
            API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Connection</span>
              <Badge
                variant="outline"
                className={apiStatus?.connected ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}
              >
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${apiStatus?.connected ? 'bg-success' : 'bg-error'}`} />
                {apiStatus?.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Response Time</span>
              <span className="text-sm text-gray-500">
                {apiStatus?.responseTime ? `${apiStatus.responseTime}ms` : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Last Check</span>
              <span className="text-sm text-gray-500">
                {apiLogs?.[0]?.timestamp ? formatDistanceToNow(new Date(apiLogs[0].timestamp), { addSuffix: true }) : '-'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => testConnectionMutation.mutate()}
              disabled={testConnectionMutation.isPending}
            >
              <Plug className="h-4 w-4 mr-2" />
              {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 text-primary mr-3" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={() => syncWarehousesMutation.mutate()}
              disabled={syncWarehousesMutation.isPending}
            >
              <div className="flex items-center">
                <Warehouse className="h-4 w-4 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">
                  {syncWarehousesMutation.isPending ? "Syncing..." : "Fetch Warehouses"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <Download className="h-4 w-4 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Export Logs</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <Trash2 className="h-4 w-4 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Clear History</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
