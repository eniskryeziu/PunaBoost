import AdminCRUDPage, { type CRUDConfig } from '@/components/admin/AdminCRUDPage';
import { skillService } from '@/services/skillService';
import type { Skill } from '@/types';
import { adminSidebarItems } from '@/utils/adminSidebarItems';

const config: CRUDConfig<Skill> = {
  title: 'Skills',
  description: 'Manage skills',
  entityName: 'Skill',
  entityNamePlural: 'Skills',
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name', className: 'font-medium' },
  ],
  formFields: [
    {
      key: 'name',
      label: 'Skill Name',
      type: 'text',
      placeholder: 'Skill name',
      required: true,
    },
  ],
  service: {
    getAll: skillService.getAll,
    create: async (data: { name: string }) => skillService.create(data.name),
    update: async (id: number, data: { name: string }) => skillService.update(id, data.name),
    delete: skillService.delete,
  },
  getItemId: (item) => item.id,
  getItemName: (item) => item.name,
  sidebarItems: adminSidebarItems,
};

export default function AdminSkillsPage() {
  return <AdminCRUDPage config={config} />;
}

