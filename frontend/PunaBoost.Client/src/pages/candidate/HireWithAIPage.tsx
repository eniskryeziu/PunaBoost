import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, FileText, TrendingUp, CheckCircle, Sparkles, Loader2, MapPin, Building2, DollarSign, ExternalLink, AlertCircle } from 'lucide-react';
import { resumeService } from '@/services/resumeService';
import { jobRecommendationService, type JobRecommendation } from '@/services/jobRecommendationService';
import type { ResumeDto } from '@/types';
import { toast } from 'sonner';
import { getDaysUntilExpiration, getExpirationBadgeInfo } from '@/utils/dateUtils';

const sidebarItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Applications', path: '/candidate/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Profile', path: '/candidate/profile', icon: <CheckCircle className="h-4 w-4" /> },
  { label: 'Hire with AI', path: '/candidate/hire-with-ai', icon: <Sparkles className="h-4 w-4" /> },
];

export default function HireWithAIPage() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoadingResumes(true);
    try {
      const data = await resumeService.getMyResumes();
      setResumes(data);
      if (data.length > 0 && !selectedResumeId) {
        const defaultResume = data.find(r => r.isDefault) || data[0];
        setSelectedResumeId(defaultResume.id);
      }
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    setLoading(true);
    setRecommendations([]);
    
    try {
      const data = await jobRecommendationService.getRecommendations(selectedResumeId);
      setRecommendations(data);
      
      if (data.length === 0) {
        toast.info('No job matches found. Try updating your resume or check back later for new opportunities.');
      } else {
        toast.success(`Found ${data.length} job recommendation${data.length > 1 ? 's' : ''} for you!`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to get recommendations';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
    return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Hire with AI
          </h1>
          <p className="text-muted-foreground">Let AI analyze your resume and find the perfect job matches</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Job Matching</CardTitle>
            <CardDescription>
              Select a resume and our AI will analyze it to find jobs that match your skills and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume">Select Resume</Label>
              {loadingResumes ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading resumes...</span>
                </div>
              ) : resumes.length === 0 ? (
                <div className="p-4 border border-dashed rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">No resumes found</p>
                  <Link to="/candidate/profile">
                    <Button variant="outline" size="sm">
                      Upload Resume
                    </Button>
                  </Link>
                </div>
              ) : (
                <Select
                  value={selectedResumeId?.toString() || ''}
                  onValueChange={(value) => setSelectedResumeId(parseInt(value))}
                >
                  <SelectTrigger id="resume" className="w-full">
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{resume.name}</span>
                          {resume.isDefault && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <Button
              onClick={handleGetRecommendations}
              disabled={loading || !selectedResumeId || resumes.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>

            {!loading && recommendations.length === 0 && selectedResumeId && (
              <div className="p-4 border border-dashed rounded-lg text-center bg-muted/30">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click "Get AI Recommendations" to find matching jobs
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recommended Jobs</h2>
              <Badge variant="secondary">{recommendations.length} match{recommendations.length > 1 ? 'es' : ''}</Badge>
            </div>

            <div className="grid gap-4">
              {recommendations.map((rec) => {
                const job = rec.job;
                const daysUntilExpiration = getDaysUntilExpiration(job.expiresAt);
                const expirationInfo = getExpirationBadgeInfo(daysUntilExpiration);

                return (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <Badge className={getMatchColor(rec.matchScore)}>
                              {rec.matchScore}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <Link
                                to={`/companies/${job.companyId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary hover:underline"
                              >
                                {job.companyName}
                              </Link>
                            </div>
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{job.location}</span>
                                {job.isRemote && (
                                  <Badge variant="outline" className="ml-2">Remote</Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            {job.salaryFrom > 0 && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                  {job.salaryFrom.toLocaleString()}
                                  {job.salaryTo && ` - ${job.salaryTo.toLocaleString()}`}
                                </span>
                              </div>
                            )}
                            {expirationInfo && (
                              <Badge variant={expirationInfo.variant as any}>
                                {expirationInfo.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <p className="text-sm font-medium mb-1 text-primary">Why this matches:</p>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill.skillId} variant="outline">
                              {skill.skillName}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="outline">+{job.skills.length - 5} more</Badge>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="flex-1"
                        >
                          View Details
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
