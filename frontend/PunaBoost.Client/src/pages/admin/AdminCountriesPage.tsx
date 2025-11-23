import AdminCRUDPage, { type CRUDConfig } from '@/components/admin/AdminCRUDPage';
import { countryService } from '@/services/countryService';
import type { Country } from '@/types';
import { adminSidebarItems } from '@/utils/adminSidebarItems';

const config: CRUDConfig<Country> = {
  title: 'Countries',
  description: 'Manage countries',
  entityName: 'Country',
  entityNamePlural: 'Countries',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name', className: 'font-medium' },
    { key: 'code', header: 'Code' },
  ],
  formFields: [
    {
      key: 'name',
      label: 'Country Name',
      type: 'text',
      placeholder: 'Country name',
      required: true,
    },
    {
      key: 'code',
      label: 'Country Code',
      type: 'text',
      placeholder: 'Country code (e.g., US, AL)',
      required: true,
      transform: (value: string) => value.toUpperCase(),
    },
  ],
  service: {
    getAll: countryService.getAll,
    create: async (data: { name: string; code: string }) => countryService.create(data.name, data.code),
    update: async (id: number, data: { name: string; code: string }) => countryService.update(id, data.name, data.code),
    delete: countryService.delete,
  },
  getItemId: (item) => item.id,
  getItemName: (item) => item.name,
  sidebarItems: adminSidebarItems,
};

export default function AdminCountriesPage() {
  return <AdminCRUDPage config={config} />;
}

