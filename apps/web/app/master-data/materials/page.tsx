'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Package, AlertCircle, Edit, Trash2, Upload, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useMaterials, 
  useCreateMaterial, 
  useUpdateMaterial, 
  useDeleteMaterial,
  useMaterialCategories 
} from '@/hooks/use-materials';
import { useAuth } from '@/hooks/use-auth';
import { ClientOnly } from '@/components/client-only';
import { toast } from 'sonner';

const materialTypes = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'CONSUMABLE', label: 'Consumable' },
  { value: 'SPARE_PART', label: 'Spare Part' },
  { value: 'FINISHED_GOOD', label: 'Finished Good' },
  { value: 'SEMI_FINISHED', label: 'Semi Finished' },
  { value: 'PACKING_MATERIAL', label: 'Packing Material' },
  { value: 'OTHERS', label: 'Others' }
];

const units = ['PCS', 'KG', 'LTR', 'MTR', 'BOX', 'SET', 'ROLL', 'PACK', 'BOTTLE', 'CAN'];

export default function MaterialsPage() {
  return (
    <DashboardLayout>
      <ClientOnly>
        <MaterialsContent />
      </ClientOnly>
    </DashboardLayout>
  );
}

function MaterialsContent() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [includeCommon, setIncludeCommon] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    subCategory: '',
    unit: 'PCS',
    type: 'RAW_MATERIAL',
    hsnCode: '',
    minStockLevel: 0,
    maxStockLevel: '',
    reorderLevel: '',
    reorderQuantity: '',
    leadTimeDays: 0,
    standardCost: '',
    isCritical: false,
    isHazardous: false,
    isCommon: false, // If true, material is common to all companies
    specifications: {}
  });

  // Fetch data
  const { data: materialsData, isLoading } = useMaterials({
    page: currentPage,
    limit: 10,
    search: searchQuery,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
    includeCommon
  });

  const { data: categories } = useMaterialCategories();
  const createMaterialMutation = useCreateMaterial();
  const updateMaterialMutation = useUpdateMaterial();
  const deleteMaterialMutation = useDeleteMaterial();

  const materials = materialsData?.materials || [];
  const pagination = materialsData?.pagination;

  const handleCreateMaterial = async () => {
    try {
      await createMaterialMutation.mutateAsync({
        ...formData,
        companyId: formData.isCommon ? undefined : user?.companyId,
        minStockLevel: Number(formData.minStockLevel),
        maxStockLevel: formData.maxStockLevel ? Number(formData.maxStockLevel) : undefined,
        reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
        reorderQuantity: formData.reorderQuantity ? Number(formData.reorderQuantity) : undefined,
        leadTimeDays: Number(formData.leadTimeDays),
        standardCost: formData.standardCost ? Number(formData.standardCost) : undefined,
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      await updateMaterialMutation.mutateAsync({
        id: selectedMaterial.id,
        data: {
          ...formData,
          companyId: formData.isCommon ? undefined : user?.companyId,
          minStockLevel: Number(formData.minStockLevel),
          maxStockLevel: formData.maxStockLevel ? Number(formData.maxStockLevel) : undefined,
          reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
          reorderQuantity: formData.reorderQuantity ? Number(formData.reorderQuantity) : undefined,
          leadTimeDays: Number(formData.leadTimeDays),
          standardCost: formData.standardCost ? Number(formData.standardCost) : undefined,
        }
      });
      
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
      resetForm();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      await deleteMaterialMutation.mutateAsync(id);
    }
  };

  const handleEdit = (material: any) => {
    setSelectedMaterial(material);
    setFormData({
      code: material.code,
      name: material.name,
      description: material.description || '',
      category: material.category,
      subCategory: material.subCategory || '',
      unit: material.unit,
      type: material.type,
      hsnCode: material.hsnCode || '',
      minStockLevel: material.minStockLevel,
      maxStockLevel: material.maxStockLevel?.toString() || '',
      reorderLevel: material.reorderLevel?.toString() || '',
      reorderQuantity: material.reorderQuantity?.toString() || '',
      leadTimeDays: material.leadTimeDays,
      standardCost: material.standardCost?.toString() || '',
      isCritical: material.isCritical,
      isHazardous: material.isHazardous,
      isCommon: !material.companyId,
      specifications: material.specifications || {}
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      category: '',
      subCategory: '',
      unit: 'PCS',
      type: 'RAW_MATERIAL',
      hsnCode: '',
      minStockLevel: 0,
      maxStockLevel: '',
      reorderLevel: '',
      reorderQuantity: '',
      leadTimeDays: 0,
      standardCost: '',
      isCritical: false,
      isHazardous: false,
      isCommon: false,
      specifications: {}
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      RAW_MATERIAL: 'bg-blue-100 text-blue-800',
      CONSUMABLE: 'bg-green-100 text-green-800',
      SPARE_PART: 'bg-orange-100 text-orange-800',
      FINISHED_GOOD: 'bg-purple-100 text-purple-800',
      SEMI_FINISHED: 'bg-yellow-100 text-yellow-800',
      PACKING_MATERIAL: 'bg-pink-100 text-pink-800',
      OTHERS: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Materials Master</h1>
              <p className="text-gray-600 mt-1">Manage material definitions and specifications</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map(cat => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {materialTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-common"
                  checked={includeCommon}
                  onCheckedChange={setIncludeCommon}
                />
                <Label htmlFor="include-common">Include Common</Label>
              </div>

              <Button variant="outline" className="justify-self-end">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </Card>

          {/* Materials List */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name & Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Levels
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Loading materials...
                      </td>
                    </tr>
                  ) : materials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No materials found
                      </td>
                    </tr>
                  ) : (
                    materials.map((material) => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {material.code}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{material.name}</div>
                            <div className="text-sm text-gray-500">{material.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getTypeColor(material.type)} variant="secondary">
                            {materialTypes.find(t => t.value === material.type)?.label || material.type}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div>Min: {material.minStockLevel}</div>
                            {material.reorderLevel && (
                              <div className="text-gray-500">Reorder: {material.reorderLevel}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {material.company ? (
                            <Badge variant="outline">{material.company.name}</Badge>
                          ) : (
                            <Badge variant="secondary">Common</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {material.isCritical && (
                              <Badge className="bg-red-100 text-red-800" variant="secondary">
                                Critical
                              </Badge>
                            )}
                            {material.isHazardous && (
                              <Badge className="bg-orange-100 text-orange-800" variant="secondary">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Hazardous
                              </Badge>
                            )}
                            {material.isActive ? (
                              <Badge className="bg-green-100 text-green-800" variant="secondary">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800" variant="secondary">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(material)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(material.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} materials
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Create/Edit Material Dialog */}
          <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedMaterial(null);
              resetForm();
            }
          }}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditDialogOpen ? 'Edit Material' : 'Create New Material'}
                </DialogTitle>
                <DialogDescription>
                  {isEditDialogOpen 
                    ? 'Update material information and specifications' 
                    : 'Add a new material to the master data'}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Material Code *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g., STL-001"
                        disabled={isEditDialogOpen}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Material Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Steel Plate 10mm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Steel Products"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subCategory">Sub Category</Label>
                      <Input
                        id="subCategory"
                        value={formData.subCategory}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        placeholder="e.g., Plates"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Material Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {materialTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit of Measure *</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger id="unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hsnCode">HSN Code</Label>
                      <Input
                        id="hsnCode"
                        value={formData.hsnCode}
                        onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                        placeholder="e.g., 7208"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="standardCost">Standard Cost</Label>
                      <Input
                        id="standardCost"
                        type="number"
                        value={formData.standardCost}
                        onChange={(e) => setFormData({ ...formData, standardCost: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Material description and specifications"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isCritical"
                        checked={formData.isCritical}
                        onCheckedChange={(checked) => setFormData({ ...formData, isCritical: checked })}
                      />
                      <Label htmlFor="isCritical">Critical Material</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isHazardous"
                        checked={formData.isHazardous}
                        onCheckedChange={(checked) => setFormData({ ...formData, isHazardous: checked })}
                      />
                      <Label htmlFor="isHazardous">Hazardous Material</Label>
                    </div>

                    {user?.role === 'SUPER_ADMIN' && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isCommon"
                          checked={formData.isCommon}
                          onCheckedChange={(checked) => setFormData({ ...formData, isCommon: checked })}
                        />
                        <Label htmlFor="isCommon">Common to All Companies</Label>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minStockLevel">Minimum Stock Level *</Label>
                      <Input
                        id="minStockLevel"
                        type="number"
                        value={formData.minStockLevel}
                        onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxStockLevel">Maximum Stock Level</Label>
                      <Input
                        id="maxStockLevel"
                        type="number"
                        value={formData.maxStockLevel}
                        onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reorderLevel">Reorder Level</Label>
                      <Input
                        id="reorderLevel"
                        type="number"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                      <Input
                        id="reorderQuantity"
                        type="number"
                        value={formData.reorderQuantity}
                        onChange={(e) => setFormData({ ...formData, reorderQuantity: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leadTimeDays">Lead Time (Days)</Label>
                      <Input
                        id="leadTimeDays"
                        type="number"
                        value={formData.leadTimeDays}
                        onChange={(e) => setFormData({ ...formData, leadTimeDays: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specifications" className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Add technical specifications and custom properties for this material.
                  </div>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Specification
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setSelectedMaterial(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={isEditDialogOpen ? handleUpdateMaterial : handleCreateMaterial}
                  disabled={!formData.code || !formData.name || !formData.category}
                >
                  {isEditDialogOpen ? 'Update Material' : 'Create Material'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </div>
  );
}