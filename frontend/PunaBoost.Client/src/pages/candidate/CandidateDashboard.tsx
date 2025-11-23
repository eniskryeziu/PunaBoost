import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jobApplicationService } from '@/services/jobApplicationService';
import type { JobApplicationDto } from '@/types';
import { Briefcase, FileText, TrendingUp, CheckCircle, Sparkles, MapPin, Calendar, ExternalLink, Clock } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Applications', path: '/candidate/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Profile', path: '/candidate/profile', icon: <CheckCircle className="h-4 w-4" /> },
  { label: 'Hire with AI', path: '/candidate/hire-with-ai', icon: <Sparkles className="h-4 w-4" /> },
];

const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
  [ApplicationStatus.Pending]: { variant: 'secondary', label: 'Pending' },
  [ApplicationStatus.Reviewed]: { variant: 'default', label: 'Reviewed' },
  [ApplicationStatus.Shortlisted]: { variant: 'default', label: 'Shortlisted' },
  [ApplicationStatus.Interview]: { variant: 'default', label: 'Interview' },
  [ApplicationStatus.Accepted]: { variant: 'default', label: 'Accepted' },
  [ApplicationStatus.Rejected]: { variant: 'destructive', label: 'Rejected' },
};

export default function CandidateDashboard() {
  const [applications, setApplications] = useState<JobApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apps = await jobApplicationService.getMyApplications();
        // Sort by appliedAt descending to get most recent first
        const sortedApps = apps.sort((a, b) => 
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
        setApplications(sortedApps);
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = applications.filter((app) => app.status === 'Pending').length;
  const acceptedCount = applications.filter((app) => app.status === 'Accepted').length;
  const interviewCount = applications.filter((app) => app.status === 'Interview').length;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your application overview.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewCount}</div>
              <p className="text-xs text-muted-foreground">Scheduled interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{acceptedCount}</div>
              <p className="text-xs text-muted-foreground">Job offers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </div>
            {applications.length > 5 && (
              <Link to="/candidate/applications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No applications yet</p>
                <p className="text-muted-foreground mb-6">Start applying to jobs to see your applications here</p>
                <Link to="/jobs">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((application) => {
                  const statusInfo = statusConfig[application.status];
                  
                  return (
                    <div
                      key={application.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      {application.companyLogoUrl && (
                        <img
                          src={application.companyLogoUrl.startsWith('http') || application.companyLogoUrl.startsWith('data:') 
                            ? application.companyLogoUrl 
                            : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5126'}/documents/CompaniesLogo/${application.companyLogoUrl}`}
                          alt={application.companyName || 'Company'}
                          className="w-12 h-12 rounded-lg object-cover border flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link to={`/jobs/${application.jobId}`}>
                              <p className="font-semibold hover:underline line-clamp-1">
                                {application.jobTitle || 'Job Application'}
                              </p>
                            </Link>
                            {application.companyName && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                {application.companyId ? (
                                  <Link
                                    to={`/companies/${application.companyId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="truncate hover:text-primary hover:underline transition-colors"
                                  >
                                    <span className="truncate">{application.companyName}</span>
                                  </Link>
                                ) : (
                                  <span className="truncate">{application.companyName}</span>
                                )}
                              </p>
                            )}
                          </div>
                          <Badge variant={statusInfo.variant} className="shrink-0">
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          {application.cityName && application.countryName && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="truncate">{application.cityName}, {application.countryName}</span>
                            </div>
                          )}
                          {application.jobExpiresAt && (() => {
                            const daysLeft = getDaysUntilExpiration(application.jobExpiresAt);
                            const badgeInfo = getExpirationBadgeInfo(daysLeft);
                            return badgeInfo ? (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{badgeInfo.label}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <Link to={`/jobs/${application.jobId}`}>
                        <Button variant="ghost" size="sm" className="shrink-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

