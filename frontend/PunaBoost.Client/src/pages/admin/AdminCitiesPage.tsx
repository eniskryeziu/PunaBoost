import AdminCRUDPage, { type CRUDConfig } from '@/components/admin/AdminCRUDPage';
import { cityService } from '@/services/cityService';
import { countryService } from '@/services/countryService';
import type { City } from '@/types';
import { adminSidebarItems } from '@/utils/adminSidebarItems';

const config: CRUDConfig<City> = {
  title: 'Cities',
  description: 'Manage cities',
  entityName: 'City',
  entityNamePlural: 'Cities',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name', className: 'font-medium' },
    { key: 'countryName', header: 'Country' },
  ],
  formFields: [
    {
      key: 'name',
      label: 'City Name',
      type: 'text',
      placeholder: 'City name',
      required: true,
    },
    {
      key: 'countryId',
      label: 'Country',
      type: 'select',
      required: true,
      getOptions: async () => {
        const countries = await countryService.getAll();
        return countries.map((c) => ({ value: c.id, label: c.name }));
      },
    },
  ],
  service: {
    getAll: cityService.getAll,
    create: async (data: { name: string; countryId: number }) => cityService.create(data.name, data.countryId),
    update: async (id: number, data: { name: string; countryId: number }) => cityService.update(id, data.name, data.countryId),
    delete: cityService.delete,
  },
  getItemId: (item) => item.id,
  getItemName: (item) => item.name,
  sidebarItems: adminSidebarItems,
};

export default function AdminCitiesPage() {
  return <AdminCRUDPage config={config} />;
}
