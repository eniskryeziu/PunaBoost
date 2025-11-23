import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { jobService } from '@/services/jobService';
import { jobApplicationService } from '@/services/jobApplicationService';
import type { JobDto, JobApplicationDto } from '@/types';
import { Briefcase, FileText, Settings, Plus, MapPin, Calendar, ExternalLink, User, Clock } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
  [ApplicationStatus.Pending]: { variant: 'secondary', label: 'Pending' },
  [ApplicationStatus.Reviewed]: { variant: 'default', label: 'Reviewed' },
  [ApplicationStatus.Shortlisted]: { variant: 'default', label: 'Shortlisted' },
  [ApplicationStatus.Interview]: { variant: 'default', label: 'Interview' },
  [ApplicationStatus.Accepted]: { variant: 'default', label: 'Accepted' },
  [ApplicationStatus.Rejected]: { variant: 'destructive', label: 'Rejected' },
};

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [applications, setApplications] = useState<JobApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs and applications in parallel
        const [jobsData, allApps] = await Promise.all([
          jobService.getMyJobs(),
          jobApplicationService.getAllCompanyApplications(),
        ]);
        setJobs(jobsData);
        // Applications are already sorted by appliedAt descending from the API
        setApplications(allApps);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app) => app.status === 'Pending').length;

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Dashboard</h1>
            <p className="text-muted-foreground">Manage your jobs and applications</p>
          </div>
          <Link to="/company/jobs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-xs text-muted-foreground">Total job postings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">All time applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Your latest job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                <Link to="/company/jobs/create">
                  <Button>Post Your First Job</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <Link to={`/company/jobs/${job.id}`}>
                        <p className="font-medium hover:underline">{job.title}</p>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {job.cityName} • {job.applications?.length || 0} applications
                      </p>
                    </div>
                    <Link to={`/company/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your latest job applications</CardDescription>
            </div>
            {applications.length > 5 && (
              <Link to="/company/applications">
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
                <p className="text-muted-foreground mb-6">Applications from candidates will appear here</p>
                <Link to="/company/jobs/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Job
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
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link to={`/company/jobs/${application.jobId}/applications`}>
                              <p className="font-semibold hover:underline line-clamp-1">
                                {application.jobTitle || 'Job Application'}
                              </p>
                            </Link>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span className="truncate">{application.candidateName || 'Candidate'}</span>
                            </p>
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
                      <Link to={`/company/jobs/${application.jobId}/applications`}>
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

