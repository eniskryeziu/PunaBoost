import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { jobApplicationService } from '@/services/jobApplicationService';
import type { JobApplicationDto } from '@/types';
import { ApplicationStatus } from '@/types';
import { Briefcase, FileText, TrendingUp, CheckCircle, Sparkles, MapPin, DollarSign, Calendar, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo } from '@/utils/dateUtils';
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

export default function CandidateApplicationsPage() {
  const [applications, setApplications] = useState<JobApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apps = await jobApplicationService.getMyApplications();
        setApplications(apps);
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track your job applications</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No applications yet</p>
                <p className="text-muted-foreground mb-6">Start applying to jobs to see your applications here</p>
                <Link to="/jobs">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => {
              const statusInfo = statusConfig[application.status];
              
              return (
                <Card key={application.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
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
                        <CardTitle className="text-lg wrap-anywhere">
                          {application.jobTitle ? (
                            <Link
                              to={`/jobs/${application.jobId}`}
                              className="hover:underline"
                            >
                              {application.jobTitle}
                            </Link>
                          ) : (
                            'Job Application'
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {application.companyName && (
                            <div className="flex items-center gap-1">
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
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={statusInfo.variant} className="shrink-0">
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    {(application.cityName || application.countryName || application.jobLocation || application.salaryFrom) && (
                      <div className="flex flex-col gap-2 text-sm">
                        {(application.cityName || application.countryName || application.jobLocation) && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {application.cityName && application.countryName 
                                ? `${application.cityName}, ${application.countryName}`
                                : application.jobLocation || 'Location not specified'}
                            </span>
                            {application.isRemote && <Badge variant="secondary" className="text-xs ml-1">Remote</Badge>}
                          </div>
                        )}
                        {application.salaryFrom && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {application.salaryFrom.toLocaleString()}{application.salaryTo ? ` - ${application.salaryTo.toLocaleString()}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      
                      {application.notes && (
                        <Collapsible 
                          open={expandedNotes.has(application.id)} 
                          onOpenChange={() => {
                            setExpandedNotes(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(application.id)) {
                                newSet.delete(application.id);
                              } else {
                                newSet.add(application.id);
                              }
                              return newSet;
                            });
                          }}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full justify-between h-auto font-medium text-sm text-muted-foreground hover:bg-muted"
                              style={{ padding: '4px 0px' }}
                            >
                              <span className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Your Notes
                              </span>
                              {expandedNotes.has(application.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pt-2">
                            <div className="bg-muted/50 p-3 rounded-md border">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {application.notes}
                              </p>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                      
                      {application.jobExpiresAt && (() => {
                        const daysLeft = getDaysUntilExpiration(application.jobExpiresAt);
                        const badgeInfo = getExpirationBadgeInfo(daysLeft);
                        return badgeInfo ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{badgeInfo.label}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                    
                    {application.jobTitle && (
                      <div className="mt-4 pt-4 border-t">
                        <Link to={`/jobs/${application.jobId}`} className="block">
                          <Button variant="outline" size="sm" className="w-full">
                            View Job Details
                            <ExternalLink className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

