import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { companyService } from '@/services/companyService';
import type { CompanyDto } from '@/types';
import { toast } from 'sonner';
import { Loader2, Globe, MapPin } from 'lucide-react';
import { adminSidebarItems } from '@/utils/adminSidebarItems';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (error) {
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">View all registered companies</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Companies</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-32 p-6">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full touch-pan-x">
                <div className="min-w-full inline-block align-middle">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[80px]">ID</TableHead>
                        <TableHead className="min-w-[150px]">Company Name</TableHead>
                        <TableHead className="min-w-[120px]">Location</TableHead>
                        <TableHead className="min-w-[120px]">Country/City</TableHead>
                        <TableHead className="min-w-[100px]">Website</TableHead>
                        <TableHead className="min-w-[100px]">Employees</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No companies found
                          </TableCell>
                        </TableRow>
                      ) : (
                        companies.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell className="font-mono text-xs">{company.id.slice(0, 8)}...</TableCell>
                            <TableCell className="font-medium">{company.companyName}</TableCell>
                            <TableCell>
                              {company.location ? (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  {company.location}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {company.countryName || company.cityName ? (
                                <span className="text-sm">
                                  {company.cityName && company.countryName
                                    ? `${company.countryName}, ${company.cityName}`
                                    : company.countryName || company.cityName}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {company.website ? (
                                <a
                                  href={company.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-2"
                                >
                                  <Globe className="h-3 w-3" />
                                  <span className="text-sm">Visit</span>
                                </a>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {company.numberOfEmployees ? (
                                <span className="text-sm">{company.numberOfEmployees}</span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

