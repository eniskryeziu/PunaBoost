import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { jobApplicationService } from '@/services/jobApplicationService';
import { jobService } from '@/services/jobService';
import type { JobApplicationDto, JobDto, JobApplicationUpdateDto } from '@/types';
import { ApplicationStatus } from '@/types';
import { Briefcase, FileText, Settings, Eye, ChevronDown, ChevronUp, User, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

const statusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [ApplicationStatus.Reviewed]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [ApplicationStatus.Shortlisted]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [ApplicationStatus.Interview]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  [ApplicationStatus.Accepted]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [ApplicationStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function CompanyApplicationsPage() {
  const { id } = useParams(); // Route parameter is 'id', not 'jobId'
  const [applications, setApplications] = useState<JobApplicationDto[]>([]);
  const [job, setJob] = useState<JobDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const [apps, jobData] = await Promise.all([
            jobApplicationService.getApplicationsByJob(id),
            jobService.getById(id),
          ]);
          // Sort by appliedAt descending (newest first)
          const sortedApps = [...apps].sort((a, b) => 
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
          );
          setApplications(sortedApps);
          setJob(jobData);
        } else {
          // Get all applications for all company's jobs in a single call
          const allApps = await jobApplicationService.getAllCompanyApplications();
          // Sort by appliedAt descending (newest first)
          const sortedApps = [...allApps].sort((a, b) => 
            new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
          );
          setApplications(sortedApps);
        }
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusUpdate = async (applicationId: number, newStatus: ApplicationStatus) => {
    try {
      const updateDto: JobApplicationUpdateDto = { status: newStatus };
      const updated = await jobApplicationService.updateStatus(applicationId, updateDto);
      setApplications(
        applications.map((app) => (app.id === applicationId ? updated : app))
      );
      toast.success('Application status updated');
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const getResumeUrl = (resumeUrl: string) => {
    if (!resumeUrl) return '';
    if (resumeUrl.startsWith('http')) return resumeUrl;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5126/api';
    const baseUrl = apiUrl.replace('/api', '');
    // Resumes are stored in Documents/Resumes folder
    // FileUrl is just the filename, need to add Resumes/ prefix
    return `${baseUrl}/documents/Resumes/${resumeUrl}`;
  };

  const toggleNotes = (applicationId: number) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

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
          <h1 className="text-3xl font-bold">
            {job ? `Applications for ${job.title}` : 'All Applications'}
          </h1>
          <p className="text-muted-foreground">Review and manage job applications</p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No applications found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const resumeUrl = application.resumeUrl || application.candidateResumeUrl;
              const hasResume = !!resumeUrl;
              
              return (
                <Card key={application.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/30">
                  <div className="flex flex-col md:flex-row gap-4 p-6 py-0">
                    {/* Left Section - Candidate Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/30 shadow-sm">
                        <User className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold mb-1.5 text-foreground">
                              {application.candidateName || `Candidate #${application.candidateId.slice(0, 8)}`}
                            </CardTitle>
                            <CardDescription className="text-sm flex items-center gap-1.5 mb-2">
                              <Mail className="h-3.5 w-3.5" />
                              {application.candidateEmail}
                            </CardDescription>
                            {application.candidatePhoneNumber && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{application.candidatePhoneNumber}</span>
                              </div>
                            )}
                            {/* Job Title and Link */}
                            {application.jobTitle && (
                              <div className="mb-2">
                                <Link 
                                  to={`/company/jobs/${application.jobId}`}
                                  className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5"
                                >
                                  <Briefcase className="h-4 w-4" />
                                  {application.jobTitle}
                                </Link>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>
                                Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                          <Badge className={`${statusColors[application.status]} flex-shrink-0 px-3 py-1.5 font-semibold shadow-sm`}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Section - Actions and Notes */}
                    <div className="flex flex-col gap-4 md:w-80 lg:w-96">
                      <CardContent className="p-0 space-y-4">
                        {application.notes && (
                          <Collapsible open={expandedNotes.has(application.id)} onOpenChange={() => toggleNotes(application.id)}>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-between p-3 px-0 h-auto font-medium text-sm hover:bg-muted/80 border border-border/50 rounded-md"
                              >
                                <span className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Application Notes
                                </span>
                                {expandedNotes.has(application.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pt-3">
                              <div className="bg-muted/60 p-4 rounded-lg border border-border/50">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                  {application.notes}
                                </p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-semibold mb-2.5 block text-foreground">Application Status</Label>
                            <Select
                              value={application.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(application.id, value as ApplicationStatus)
                              }
                            >
                              <SelectTrigger className="w-full border-border/50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ApplicationStatus).map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex flex-col gap-2.5 pt-2 border-t border-border/50">
                            <Link to={`/candidates/${application.candidateId}`} className="w-full">
                              <Button variant="outline" className="w-full" size="sm" >
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </Link>
                            {hasResume && (
                              <Button
                                variant="default"
                                size="sm"
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={() => {
                                  const fullUrl = getResumeUrl(resumeUrl!);
                                  window.open(fullUrl, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Resume
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

