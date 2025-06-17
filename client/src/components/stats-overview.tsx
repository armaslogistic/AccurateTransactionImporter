import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, CheckCircle, AlertTriangle, Warehouse } from "lucide-react";

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const statCards = [
    {
      title: "Total Imports",
      value: stats?.totalImports || 0,
      icon: Upload,
      color: "bg-blue-100 text-primary",
    },
    {
      title: "Successful",
      value: stats?.successful || 0,
      icon: CheckCircle,
      color: "bg-green-100 text-success",
    },
    {
      title: "Failed",
      value: stats?.failed || 0,
      icon: AlertTriangle,
      color: "bg-red-100 text-error",
    },
    {
      title: "Warehouses",
      value: stats?.warehouses || 0,
      icon: Warehouse,
      color: "bg-orange-100 text-warning",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-200 rounded-lg w-12 h-12" />
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
