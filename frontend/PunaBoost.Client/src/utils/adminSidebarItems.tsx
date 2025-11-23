import { Shield, Building2, Wrench, Globe, MapPin, Users } from 'lucide-react';

export const adminSidebarItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: <Shield className="h-4 w-4" /> },
  { label: 'Industries', path: '/admin/industries', icon: <Building2 className="h-4 w-4" /> },
  { label: 'Skills', path: '/admin/skills', icon: <Wrench className="h-4 w-4" /> },
  { label: 'Countries', path: '/admin/countries', icon: <Globe className="h-4 w-4" /> },
  { label: 'Cities', path: '/admin/cities', icon: <MapPin className="h-4 w-4" /> },
  { label: 'Candidates', path: '/admin/candidates', icon: <Users className="h-4 w-4" /> },
  { label: 'Companies', path: '/admin/companies', icon: <Building2 className="h-4 w-4" /> },
];

