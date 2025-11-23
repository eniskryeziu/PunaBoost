import AdminCRUDPage, { type CRUDConfig } from '@/components/admin/AdminCRUDPage';
import { industryService } from '@/services/industryService';
import type { Industry } from '@/types';
import { adminSidebarItems } from '@/utils/adminSidebarItems';

const config: CRUDConfig<Industry> = {
  title: 'Industries',
  description: 'Manage industries',
  entityName: 'Industry',
  entityNamePlural: 'Industries',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name', className: 'font-medium' },
  ],
  formFields: [
    {
      key: 'name',
      label: 'Industry Name',
      type: 'text',
      placeholder: 'Industry name',
      required: true,
    },
  ],
  service: {
    getAll: industryService.getAll,
    create: async (data: { name: string }) => industryService.create(data.name),
    update: async (id: number, data: { name: string }) => industryService.update(id, data.name),
    delete: industryService.delete,
  },
  getItemId: (item) => item.id,
  getItemName: (item) => item.name,
  sidebarItems: adminSidebarItems,
};

export default function AdminIndustriesPage() {
  return <AdminCRUDPage config={config} />;
}

