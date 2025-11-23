import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { jobService } from '@/services/jobService';
import type { JobDto } from '@/types';
import { Briefcase, FileText, Settings, Plus, Edit, Trash2, MapPin, DollarSign, Building2, Calendar, Users } from 'lucide-react';
import { formatExpirationDate } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await jobService.getMyJobs();
        setJobs(data);
      } catch (error) {
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await jobService.delete(id);
      setJobs(jobs.filter((job) => job.id !== id));
      toast.success('Job deleted successfully');
    } catch (error) {
      // Error handled by interceptor
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Jobs</h1>
            <p className="text-muted-foreground">Manage your job postings</p>
          </div>
          <Link to="/company/jobs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No jobs posted yet</p>
                <Link to="/company/jobs/create">
                  <Button>Post Your First Job</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {jobs.map((job) => (
              <Card key={job.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        {job.cityName && job.countryName ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{job.cityName}, {job.countryName}</span>
                          </div>
                        ) : job.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{job.location}</span>
                          </div>
                        ) : null}
                        {job.isRemote && (
                          <Badge variant="secondary" className="text-xs">Remote</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link to={`/company/jobs/${job.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the job posting.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(job.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Salary</span>
                          <span className="font-medium">
                            ${job.salaryFrom.toLocaleString()}{job.salaryTo ? ` - ${job.salaryTo.toLocaleString()}` : ''}
                          </span>
                        </div>
                      </div>
                      {job.industryName && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Industry</span>
                            <span className="font-medium truncate">{job.industryName}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Required Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill.skillId} variant="outline" className="text-xs">
                              {skill.skillName}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Applications Count and Dates */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-3 border-t border-b flex-wrap">
                      <Users className="h-4 w-4" />
                          <span>{job.applications ? job.applications.length : 0} application{(job.applications ? job.applications.length : 0) !== 1 ? 's' : ''}</span>
                      {job.postedAt && (
                        <>
                          <span>•</span>
                          <Calendar className="h-4 w-4" />
                          <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
                        </>
                      )}
                      {job.expiresAt && (() => {
                        return (
                          <>
                            <span>•</span>
                            <Calendar className="h-4 w-4" />
                            <span>Expires: {formatExpirationDate(job.expiresAt)}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2 pt-3">
                    <Link to={`/company/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link to={`/company/jobs/${job.id}/applications`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Applications
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

