import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, RefreshCw, Eye, Download, AlertTriangle, RotateCcw, Monitor, X, FileText, Warehouse } from "lucide-react";
import { format } from "date-fns";

export default function HistoryTable() {
  const { data: imports, isLoading, refetch } = useQuery({
    queryKey: ["/api/imports"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'failed':
        return 'bg-error/10 text-error border-error/20';
      case 'processing':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Eye className="h-3 w-3 mr-1" />;
      case 'failed':
        return <X className="h-3 w-3 mr-1" />;
      case 'processing':
        return <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-3" />
            Import History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 text-primary mr-3" />
            Import History
          </CardTitle>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="relative">
              <Input
                placeholder="Search imports..."
                className="w-64 pl-10"
              />
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Import Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports?.length > 0 ? (
                imports.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {record.type === 'warehouse' ? (
                          <Warehouse className="h-4 w-4 text-gray-400 mr-2" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {record.type === 'sales-invoice' ? 'Sales Invoice' : record.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {record.fileName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(record.status)}
                      >
                        {getStatusIcon(record.status)}
                        {record.status === 'processing' ? 'Processing' : 
                         record.status === 'completed' ? 'Completed' : 
                         record.status === 'failed' ? 'Failed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      {record.successfulRecords || 0}/{record.totalRecords || 0}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {record.createdAt ? format(new Date(record.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          {record.status === 'processing' ? (
                            <Monitor className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        {record.status === 'failed' && (
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          {record.status === 'failed' ? (
                            <AlertTriangle className="h-4 w-4 text-error" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No import history found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
