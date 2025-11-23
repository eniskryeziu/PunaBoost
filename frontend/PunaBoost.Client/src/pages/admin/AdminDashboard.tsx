import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { jobService } from '@/services/jobService';
import { candidateService } from '@/services/candidateService';
import { companyService } from '@/services/companyService';
import { Briefcase, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminSidebarItems } from '@/utils/adminSidebarItems';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    candidates: 0,
    companies: 0,
  });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobs, candidates, companies] = await Promise.all([
          jobService.getAll(),
          candidateService.getAll(),
          companyService.getAll(),
        ]);
        setStats({
          jobs: jobs.length,
          candidates: candidates.length,
          companies: companies.length,
        });
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout sidebarItems={adminSidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage the PunaBoost platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobs}</div>
              <p className="text-xs text-muted-foreground">Active job postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.candidates}</div>
              <p className="text-xs text-muted-foreground">Registered candidates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.companies}</div>
              <p className="text-xs text-muted-foreground">Registered companies</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

