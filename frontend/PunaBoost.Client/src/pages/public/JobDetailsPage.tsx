import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { jobService } from '@/services/jobService';
import { jobApplicationService } from '@/services/jobApplicationService';
import { resumeService } from '@/services/resumeService';
import { useAppSelector } from '@/store/hooks';
import type { JobDto, JobApplicationCreateDto, ResumeDto } from '@/types';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, MapPin, Briefcase, DollarSign, Calendar, FileText, TrendingUp, CheckCircle, Settings, Sparkles, Building2, Clock, Users } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo, formatExpirationDate } from '@/utils/dateUtils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

const applicationSchema = z.object({
  resumeId: z.number().optional(),
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [job, setJob] = useState<JobDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [myApplication, setMyApplication] = useState<{ resumeName?: string; resumeUrl?: string; notes?: string } | null>(null);

  const getSidebarItems = () => {
    if (!user) return [];
    if (user.role === 'Company') return companySidebarItems;
    if (user.role === 'Candidate') return candidateSidebarItems;
    return [];
  };

  const sidebarItems = getSidebarItems();
  const shouldUseDashboard = isAuthenticated && sidebarItems.length > 0;

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        const data = await jobService.getById(id);
        setJob(data);
      } catch (error) {
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // Check if candidate has already applied to this job
  useEffect(() => {
    const checkApplication = async () => {
      if (!id || !isAuthenticated || user?.role !== 'Candidate') {
        setHasApplied(false);
        setMyApplication(null);
        return;
      }

      setCheckingApplication(true);
      try {
        const applications = await jobApplicationService.getMyApplications();
        const application = applications.find(app => app.jobId === id);
        if (application) {
          setHasApplied(true);
          setMyApplication({
            resumeName: application.resumeName || undefined,
            resumeUrl: application.resumeUrl || undefined,
            notes: application.notes || undefined,
          });
        } else {
          setHasApplied(false);
          setMyApplication(null);
        }
      } catch (error) {
        // If error, assume not applied (don't block the UI)
        setHasApplied(false);
        setMyApplication(null);
      } finally {
        setCheckingApplication(false);
      }
    };
    checkApplication();
  }, [id, isAuthenticated, user]);

  // Load resumes when dialog opens
  useEffect(() => {
    const loadResumes = async () => {
      if (!showDialog || !isAuthenticated || user?.role !== 'Candidate') return;
      
      setLoadingResumes(true);
      try {
        const data = await resumeService.getMyResumes();
        setResumes(data);
        // Set default resume if available
        const defaultResume = data.find(r => r.isDefault);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        }
      } catch (error) {
        toast.error('Failed to load resumes');
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, [showDialog, isAuthenticated, user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!job || !isAuthenticated) return;
    
    if (user?.role !== 'Candidate') {
      toast.error('Only candidates can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      const applicationDto: JobApplicationCreateDto = {
        jobId: job.id,
        resumeId: selectedResumeId,
        notes: data.notes || '',
      };
      await jobApplicationService.apply(applicationDto);
      toast.success('Application submitted successfully!');
      setShowDialog(false);
      setHasApplied(true); // Mark as applied
      navigate('/candidate/applications');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setApplying(false);
    }
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

  if (!job) {
    return shouldUseDashboard ? (
      <DashboardLayout sidebarItems={sidebarItems}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    ) : (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Job not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const content = (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{job.title}</CardTitle>
                <CardDescription className="text-lg">
                  <Link to={`/companies/${job.companyId}`} className="hover:underline text-primary">
                    {job.companyName}
                  </Link>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Description</h3>
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
                </div>
                {job.skills?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills?.map((skill) => (
                        <Badge key={skill.skillId} variant="secondary">
                          {skill.skillName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                        ${job.salaryFrom.toLocaleString()} - ${job.salaryTo?.toLocaleString() || 'N/A'}
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

                  {job.applications && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Applications</p>
                        <p className="font-medium">{job.applications.length} application{job.applications.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {(() => {
              if (isAuthenticated && user?.role === 'Candidate') {
                if (hasApplied) {
                  const getResumeUrl = (resumeUrl: string | undefined) => {
                    if (!resumeUrl) return '';
                    if (resumeUrl.startsWith('http')) return resumeUrl;
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5126/api';
                    const baseUrl = apiUrl.replace('/api', '');
                    // ResumeUrl from backend might already include Resumes/ or just be the filename
                    if (resumeUrl.includes('Resumes/')) {
                      return `${baseUrl}/documents/${resumeUrl}`;
                    }
                    return `${baseUrl}/documents/Resumes/${resumeUrl}`;
                  };

                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Application Submitted
                        </CardTitle>
                        <CardDescription>
                          You have already applied to this job
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {myApplication?.resumeName && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Resume Used</Label>
                            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1 text-sm">{myApplication.resumeName}</span>
                              {myApplication.resumeUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const fullUrl = getResumeUrl(myApplication.resumeUrl);
                                    window.open(fullUrl, '_blank');
                                  }}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {myApplication?.notes && (
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold">Your Notes</Label>
                            <div className="p-3 bg-muted rounded-md">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {myApplication.notes}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t">
                          <Link to="/candidate/applications" className="block">
                            <Button variant="outline" className="w-full" size="sm">
                              View All Applications
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return (
                  <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={checkingApplication}>
                        {checkingApplication ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          'Apply Now'
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for {job.title}</DialogTitle>
                        <DialogDescription>
                          Submit your application for this position
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="resume">Select Resume</Label>
                            {loadingResumes ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading resumes...
                              </div>
                            ) : resumes.length === 0 ? (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  No resumes found. Please upload a resume first.
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate('/candidate/profile')}
                                >
                                  Go to Profile
                                </Button>
                              </div>
                            ) : (
                              <Select
                                value={selectedResumeId?.toString() || ''}
                                onValueChange={(value) => setSelectedResumeId(value ? parseInt(value) : undefined)}
                              >
                                <SelectTrigger className='w-full'>
                                  <SelectValue placeholder="Select a resume" />
                                </SelectTrigger>
                                <SelectContent>
                                  {resumes.map((resume) => (
                                    <SelectItem key={resume.id} value={resume.id.toString()}>
                                      {resume.name} {resume.isDefault && '(Default)'}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Additional Notes (Optional)</Label>
                            <Textarea
                              id="notes"
                              {...register('notes')}
                              placeholder="Add any additional information or notes about your application..."
                            />
                            {errors.notes && (
                              <p className="text-sm text-destructive">
                                {errors.notes.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDialog(false)}
                            disabled={applying}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={applying || resumes.length === 0}>
                            {applying ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Applying...
                              </>
                            ) : (
                              'Submit Application'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                );
              }
              if (!isAuthenticated) {
                return (
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                      Login to Apply
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-primary hover:underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </div>
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

