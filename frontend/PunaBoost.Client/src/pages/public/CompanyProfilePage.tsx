import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { companyService } from '@/services/companyService';
import { useAppSelector } from '@/store/hooks';
import type { CompanyDto, JobDto } from '@/types';
import { toast } from 'sonner';
import { Loader2, MapPin, Globe, Calendar, Users, Briefcase, FileText, TrendingUp, CheckCircle, Settings, Sparkles, Linkedin } from 'lucide-react';

const candidateSidebarItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Applications', path: '/candidate/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Profile', path: '/candidate/profile', icon: <CheckCircle className="h-4 w-4" /> },
  { label: 'Hire with AI', path: '/candidate/hire-with-ai', icon: <Sparkles className="h-4 w-4" /> },
];

const companySidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

export default function PublicCompanyProfilePage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [loading, setLoading] = useState(true);

  const getSidebarItems = () => {
    if (!user) return [];
    if (user.role === 'Company') return companySidebarItems;
    if (user.role === 'Candidate') return candidateSidebarItems;
    return [];
  };

  const sidebarItems = getSidebarItems();
  const shouldUseDashboard = isAuthenticated && sidebarItems.length > 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [companyData, jobsData] = await Promise.all([
          companyService.getById(id),
          companyService.getJobsByCompany(id),
        ]);
        setCompany(companyData);
        
        // Filter out expired jobs on frontend as well
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const activeJobs = jobsData.filter((job) => {
          if (!job.expiresAt) return true; // Jobs without expiration are considered active
          const expiresDate = new Date(job.expiresAt);
          expiresDate.setHours(0, 0, 0, 0);
          return expiresDate >= now;
        });
        
        setJobs(activeJobs);
      } catch (error) {
        toast.error('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getLogoUrl = (logoUrl: string | undefined) => {
    if (!logoUrl) return '';
    if (logoUrl.startsWith('http') || logoUrl.startsWith('data:')) return logoUrl;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5126/api';
    // Company logos are stored in Documents/CompaniesLogo folder
    return `${apiUrl.replace('/api', '')}/documents/CompaniesLogo/${logoUrl}`;
  };

  if (loading) {
    return shouldUseDashboard ? (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    ) : (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return shouldUseDashboard ? (
      <DashboardLayout sidebarItems={sidebarItems}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Company not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    ) : (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Company not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            {company.logoUrl && (
              <img
                src={getLogoUrl(company.logoUrl)}
                alt={company.companyName}
                className="w-24 h-24 rounded-lg object-cover border"
              />
            )}
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{company.companyName}</CardTitle>
              <CardDescription className="text-base">
                {company.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(company.cityName || company.countryName) && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {company.cityName && company.countryName
                      ? `${company.cityName}, ${company.countryName}`
                      : company.countryName || company.cityName || company.location}
                  </p>
                </div>
              </div>
            )}
            
            {company.website && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline text-xs md:text-sm break-all"
                  >
                    {company.website}
                  </a>
                </div>
              </div>
            )}

            {company.linkedIn && (
              <div className="flex items-start gap-3">
                <Linkedin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">LinkedIn</p>
                  <a
                    href={company.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline text-xs md:text-sm break-all"
                  >
                    View Profile
                  </a>
                </div>
              </div>
            )}

            {company.foundedYear && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Founded</p>
                  <p className="font-medium">{company.foundedYear}</p>
                </div>
              </div>
            )}

            {company.numberOfEmployees && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium">{company.numberOfEmployees.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Current job openings at {company.companyName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {jobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {(job.cityName || job.countryName) && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {job.cityName && job.countryName
                                    ? `${job.cityName}, ${job.countryName}`
                                    : job.countryName || job.cityName || job.location}
                                </span>
                                {job.isRemote && <Badge variant="secondary" className="ml-2">Remote</Badge>}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>${job.salaryFrom.toLocaleString()} - ${job.salaryTo?.toLocaleString() || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">View Details</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return shouldUseDashboard ? (
    <DashboardLayout sidebarItems={sidebarItems}>
      {content}
    </DashboardLayout>
  ) : (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {content}
      </div>
    </div>
  );
}

