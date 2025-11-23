import { useEffect, useState, type ReactNode } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import DeleteConfirmDialog from '@/components/common/DeleteConfirmDialog';

export interface CRUDColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface CRUDFormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string | number; label: string }[];
  getOptions?: () => Promise<{ value: string | number; label: string }[]>;
  transform?: (value: any) => any;
}

export interface CRUDConfig<T> {
  title: string;
  description: string;
  entityName: string;
  entityNamePlural: string;
  columns: CRUDColumn<T>[];
  formFields: CRUDFormField[];
  service: {
    getAll: () => Promise<T[]>;
    create: (data: any) => Promise<T>;
    update: (id: number, data: any) => Promise<T>;
    delete: (id: number) => Promise<void>;
  };
  getItemId: (item: T) => number;
  getItemName: (item: T) => string;
  sidebarItems: any[];
}

export default function AdminCRUDPage<T extends { id: number }>({
  config,
}: {
  config: CRUDConfig<T>;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionsCache, setOptionsCache] = useState<Record<string, { value: string | number; label: string }[]>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await config.service.getAll();
      setItems(data);
    } catch (error) {
      toast.error(`Failed to load ${config.entityNamePlural.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (field: CRUDFormField) => {
    if (field.getOptions && !optionsCache[field.key]) {
      try {
        const options = await field.getOptions();
        setOptionsCache((prev) => ({ ...prev, [field.key]: options }));
      } catch (error) {
        console.error(`Failed to load options for ${field.key}`);
      }
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    const initialData: Record<string, any> = {};
    config.formFields.forEach((field) => {
      initialData[field.key] = '';
    });
    setFormData(initialData);
    setIsDialogOpen(true);
    
    // Load options for fields that need them
    config.formFields.forEach((field) => {
      if (field.getOptions) {
        loadOptions(field);
      }
    });
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    const data: Record<string, any> = {};
    config.formFields.forEach((field) => {
      const key = field.key as keyof T;
      data[field.key] = item[key] ?? '';
    });
    setFormData(data);
    setIsDialogOpen(true);
    
    // Load options for fields that need them
    config.formFields.forEach((field) => {
      if (field.getOptions) {
        loadOptions(field);
      }
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    for (const field of config.formFields) {
      if (field.required && !formData[field.key]?.toString().trim()) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const submitData: Record<string, any> = {};
      config.formFields.forEach((field) => {
        let value = formData[field.key];
        if (field.transform) {
          value = field.transform(value);
        }
        if (field.type === 'number') {
          value = value ? Number(value) : undefined;
        }
        submitData[field.key] = value;
      });

      if (editingItem) {
        await config.service.update(config.getItemId(editingItem), submitData);
        toast.success(`${config.entityName} updated successfully`);
      } else {
        await config.service.create(submitData);
        toast.success(`${config.entityName} created successfully`);
      }
      setIsDialogOpen(false);
      setFormData({});
      setEditingItem(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to save ${config.entityName.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await config.service.delete(id);
      toast.success(`${config.entityName} deleted successfully`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to delete ${config.entityName.toLowerCase()}`);
    }
  };

  const renderCell = (item: T, column: CRUDColumn<T>) => {
    if (column.render) {
      return column.render(item);
    }
    const key = column.key as keyof T;
    const value = item[key];
    return value?.toString() ?? 'N/A';
  };

  return (
    <DashboardLayout sidebarItems={config.sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add {config.entityName}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? `Edit ${config.entityName}` : `Add ${config.entityName}`}</DialogTitle>
                <DialogDescription>
                  {editingItem
                    ? `Update the ${config.entityName.toLowerCase()} information`
                    : `Enter the information for the new ${config.entityName.toLowerCase()}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {config.formFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.type === 'select' ? (
                      <Select
                        value={formData[field.key]?.toString() || ''}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            [field.key]: field.type === 'number' ? Number(value) : value,
                          }))
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(optionsCache[field.key] || field.options || []).map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.key]?.toString() || ''}
                        onChange={(e) => {
                          let value = field.type === 'number'
                            ? e.target.value ? Number(e.target.value) : ''
                            : e.target.value;
                          if (field.transform) {
                            value = field.transform(value);
                          }
                          setFormData((prev) => ({
                            ...prev,
                            [field.key]: value,
                          }));
                        }}
                        disabled={isSubmitting}
                        maxLength={field.key === 'code' ? 2 : undefined}
                      />
                    )}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingItem ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingItem ? 'Update' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All {config.entityNamePlural}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSpinner className="h-32" />
            ) : items.length === 0 ? (
              <EmptyState
                title={`No ${config.entityNamePlural.toLowerCase()} found`}
                description={`Get started by creating a new ${config.entityName.toLowerCase()}`}
              />
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {config.columns.map((column) => (
                        <TableHead key={String(column.key)} className={column.className}>
                          {column.header}
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={config.getItemId(item)}>
                        {config.columns.map((column) => (
                          <TableCell key={String(column.key)} className={column.className}>
                            {renderCell(item, column)}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DeleteConfirmDialog
                              trigger={
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                              description={`This action cannot be undone. This will permanently delete the ${config.entityName.toLowerCase()} "${config.getItemName(item)}".`}
                              onConfirm={() => handleDelete(config.getItemId(item))}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

