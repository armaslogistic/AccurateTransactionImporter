import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Link, Wifi, FolderInput, Warehouse, FileText, Upload, FolderOpen, Download, CheckCheck, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ImportPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<"warehouse" | "sales-invoice">("warehouse");
  const [dragOver, setDragOver] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiStatus } = useQuery({
    queryKey: ["/api/status"],
  });

  const validateMutation = useMutation({
    mutationFn: async (data: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      
      const response = await apiRequest('POST', '/api/imports/validate', formData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: "Validation Successful",
          description: `File contains ${data.recordCount} valid records`,
        });
      } else {
        toast({
          title: "Validation Failed",
          description: `Found ${data.errors.length} errors in the file`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Validation Error",
        description: "Failed to validate file",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      
      const response = await apiRequest('POST', '/api/imports', formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Import Started",
        description: "Your import job has been queued for processing",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/imports"] });
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Failed to start import job",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleValidate = () => {
    if (selectedFile) {
      validateMutation.mutate({ file: selectedFile, type: importType });
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate({ file: selectedFile, type: importType });
    }
  };

  const downloadTemplate = async (type: 'warehouse' | 'sales-invoice') => {
    try {
      const endpoint = type === 'warehouse' ? '/api/templates/warehouse' : '/api/templates/sales-invoice';
      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Template Downloaded",
        description: `${type} template has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 text-primary mr-3" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">API Host</Label>
              <Input 
                value="https://zeus.accurate.id" 
                readOnly 
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Connection Status</Label>
              <div className="flex items-center space-x-2 mt-2 py-2">
                <div className={`w-3 h-3 rounded-full ${apiStatus?.connected ? 'bg-success animate-pulse' : 'bg-error'}`} />
                <span className={`text-sm font-medium ${apiStatus?.connected ? 'text-success' : 'text-error'}`}>
                  {apiStatus?.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderInput className="h-5 w-5 text-primary mr-3" />
            Import Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Import Type Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Import Type</Label>
            <RadioGroup value={importType} onValueChange={(value: "warehouse" | "sales-invoice") => setImportType(value)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <RadioGroupItem value="warehouse" id="warehouse" className="sr-only" />
                  <Label 
                    htmlFor="warehouse" 
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      importType === 'warehouse' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Warehouse className={`h-6 w-6 mr-3 ${importType === 'warehouse' ? 'text-primary' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Warehouse Data</p>
                      <p className="text-sm text-gray-500">Import warehouse information</p>
                    </div>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem value="sales-invoice" id="sales-invoice" className="sr-only" />
                  <Label 
                    htmlFor="sales-invoice" 
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      importType === 'sales-invoice' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className={`h-6 w-6 mr-3 ${importType === 'sales-invoice' ? 'text-primary' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium text-gray-900">Sales Invoices</p>
                      <p className="text-sm text-gray-500">Import sales invoice data</p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* File Upload Area */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Excel File Upload</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {selectedFile ? selectedFile.name : "Drop your Excel file here"}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {selectedFile ? "File selected successfully" : "or click to select from your computer"}
              </p>
              <Button variant="outline" type="button">
                <FolderOpen className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              <p className="text-xs text-gray-400 mt-2">Supported formats: .xlsx, .xls</p>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Template Download */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">Download Templates</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center bg-green-50 border-green-200 hover:bg-green-100 text-gray-700"
                onClick={() => downloadTemplate('warehouse')}
              >
                <Download className="h-4 w-4 text-success mr-2" />
                Warehouse Template
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center justify-center bg-blue-50 border-blue-200 hover:bg-blue-100 text-gray-700"
                onClick={() => downloadTemplate('sales-invoice')}
              >
                <Download className="h-4 w-4 text-primary mr-2" />
                Sales Invoice Template
              </Button>
            </div>
          </div>

          {/* Import Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              className="flex-1"
              disabled={!selectedFile || importMutation.isPending}
              onClick={handleImport}
            >
              <Play className="h-4 w-4 mr-2" />
              {importMutation.isPending ? "Starting Import..." : "Start Import"}
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              disabled={!selectedFile || validateMutation.isPending}
              onClick={handleValidate}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              {validateMutation.isPending ? "Validating..." : "Validate Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
