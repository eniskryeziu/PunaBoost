import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jobService } from '@/services/jobService';
import type { JobDto } from '@/types';
import { Briefcase, FileText, Settings, Edit, MapPin, DollarSign, Calendar, Building2, Clock, Users, User, Mail, Phone, Download } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo, formatExpirationDate } from '@/utils/dateUtils';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { ApplicationStatus } from '@/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

export default function CompanyJobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const data = await jobService.getById(id);
        setJob(data);
      } catch (error) {
        toast.error('Failed to load job details');
        navigate('/company/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">Job Details</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/company/jobs/${job.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Job
              </Button>
            </Link>
            <Link to={`/company/jobs/${job.id}/applications`}>
              <Button>
                View Applications ({job.applications?.length || 0})
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border-collapse border border-border">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border px-4 py-2 text-foreground">
                          {children}
                        </td>
                      ),
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm text-foreground" {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-foreground">
                          {children}
                        </pre>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside my-4 space-y-2 text-foreground">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside my-4 space-y-2 text-foreground">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-foreground">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="my-4 text-foreground leading-relaxed">{children}</p>
                      ),
                    }}
                  >
                    {String(job.description || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {job.skills && job.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill.skillId} variant="secondary">
                        {skill.skillName}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {job.applications && job.applications.length > 0 && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Applications
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {job.applications.length} {job.applications.length === 1 ? 'application' : 'applications'} for this position
                      </CardDescription>
                    </div>
                    <Link to={`/company/jobs/${job.id}/applications`}>
                      <Button variant="outline" size="sm">
                        Manage All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {job.applications.map((application) => {
                      const statusConfig: Record<ApplicationStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, color: string }> = {
                        [ApplicationStatus.Pending]: { variant: 'secondary', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
                        [ApplicationStatus.Reviewed]: { variant: 'default', label: 'Reviewed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
                        [ApplicationStatus.Shortlisted]: { variant: 'default', label: 'Shortlisted', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
                        [ApplicationStatus.Interview]: { variant: 'default', label: 'Interview', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
                        [ApplicationStatus.Accepted]: { variant: 'default', label: 'Accepted', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
                        [ApplicationStatus.Rejected]: { variant: 'destructive', label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
                      };
                      const statusInfo = statusConfig[application.status];
                      
                      return (
                        <div
                          key={application.id}
                          className="group relative flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 border-2 border-primary/20">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <Link 
                                  to={`/candidates/${application.candidateId}`}
                                  className="font-semibold text-base mb-1 group-hover:text-primary transition-colors hover:underline inline-block"
                                >
                                  {application.candidateName || `Candidate #${application.candidateId.slice(0, 8)}`}
                                </Link>
                                <div className="flex flex-col gap-1 mt-1.5">
                                  {application.candidateEmail && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span className="truncate">{application.candidateEmail}</span>
                                    </div>
                                  )}
                                  {application.candidatePhoneNumber && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span>{application.candidatePhoneNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge className={`shrink-0 ${statusInfo.color} border-0 font-medium`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            </div>
                            
                            {application.notes && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Notes</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{application.notes}</p>
                              </div>
                            )}
                            
                            {application.candidateResumeUrl && (
                              <div className="mt-3 pt-3 border-t border-border/50">
                                <a
                                  href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5126'}/documents/Resumes/${application.candidateResumeUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Resume
                                  </Button>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {job.applications.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Link to={`/company/jobs/${job.id}/applications`} className="block">
                        <Button variant="outline" className="w-full">
                          View All Applications ({job.applications.length})
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Salary Range</p>
                      <p className="font-medium">
                        ${job.salaryFrom.toLocaleString()}{job.salaryTo ? ` - ${job.salaryTo.toLocaleString()}` : '+'}
                      </p>
                    </div>
                  </div>

                  {(job.cityName && job.countryName) || job.location ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Location</p>
                        <div className="space-y-1">
                          {job.cityName && job.countryName ? (
                            <>
                              <p className="font-medium">{job.cityName}, {job.countryName}</p>
                              {job.location && (
                                <p className="text-sm text-muted-foreground">{job.location}</p>
                              )}
                            </>
                          ) : (
                            <p className="font-medium">{job.location}</p>
                          )}
                          {job.isRemote && (
                            <Badge variant="secondary" className="text-xs">Remote</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {job.industryName && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Industry</p>
                        <p className="font-medium">{job.industryName}</p>
                      </div>
                    </div>
                  )}

                  {job.companyName && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{job.companyName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Posted Date</p>
                      <p className="font-medium">{new Date(job.postedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>

                  {job.expiresAt && (() => {
                    const daysLeft = getDaysUntilExpiration(job.expiresAt);
                    const badgeInfo = getExpirationBadgeInfo(daysLeft);
                    
                    return (
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Expiration Date</p>
                          <p className="font-medium">{formatExpirationDate(job.expiresAt)}</p>
                          {badgeInfo && (
                            <Badge variant={badgeInfo.variant} className="text-xs mt-1">
                              {badgeInfo.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Applications</p>
                      <p className="font-medium">{job.applications?.length || 0} application{(job.applications?.length || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

