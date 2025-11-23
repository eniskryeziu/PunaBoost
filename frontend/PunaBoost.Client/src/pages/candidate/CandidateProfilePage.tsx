import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { candidateService } from '@/services/candidateService';
import { skillService } from '@/services/skillService';
import { resumeService } from '@/services/resumeService';
import type { CandidateDto, CandidateUpdateDto, Skill, ResumeDto } from '@/types';
import { Briefcase, FileText, TrendingUp, CheckCircle, Search, X, Upload, Trash2, Star, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2, Sparkles  } from 'lucide-react';
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

const sidebarItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Applications', path: '/candidate/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Profile', path: '/candidate/profile', icon: <CheckCircle className="h-4 w-4" /> },
  { label: 'Hire with AI', path: '/candidate/hire-with-ai', icon: <Sparkles className="h-4 w-4" /> },
];

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CandidateProfilePage() {
  const [candidate, setCandidate] = useState<CandidateDto | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [resumes, setResumes] = useState<ResumeDto[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
  const [isDefaultResume, setIsDefaultResume] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current candidate's profile
        const currentCandidate = await candidateService.getMyProfile();
        
        if (currentCandidate) {
          setCandidate(currentCandidate);
          const candidateSkills = await candidateService.getSkills(currentCandidate.id);
          setSelectedSkills(candidateSkills.map(s => s.id));
        }
        
        const allSkillsData = await skillService.getAll();
        setAllSkills(allSkillsData);
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
      
      // Load resumes separately so they load even if profile loading fails
      try {
        await loadResumes();
      } catch (error) {
        // Error already handled in loadResumes
      }
    };
    fetchData();
  }, []);

  const loadResumes = async () => {
    setLoadingResumes(true);
    try {
      const data = await resumeService.getMyResumes();
      setResumes(data);
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoadingResumes(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: candidate ? {
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phoneNumber: candidate.phoneNumber,
    } : undefined,
  });

  useEffect(() => {
    if (candidate) {
      reset({
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        phoneNumber: candidate.phoneNumber,
      });
    }
  }, [candidate, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setUpdating(true);
    try {
      const updateDto: CandidateUpdateDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
      const updated = await candidateService.updateProfile(updateDto);
      setCandidate(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setUpdating(false);
    }
  };

  const handleSkillsUpdate = async (newSkillIds: number[], previousSkillIds: number[]) => {
    setSavingSkills(true);
    try {
      await candidateService.updateSkills({ skillIds: newSkillIds });
      toast.success('Skills updated successfully');
    } catch (error) {
      // Error handled by interceptor
      // Revert to previous state on error
      setSelectedSkills(previousSkillIds);
    } finally {
      setSavingSkills(false);
    }
  };

  const handleResumeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    
    setNewResumeFile(file);
    // Auto-fill name from filename if empty
    if (!newResumeName) {
      setNewResumeName(file.name.replace('.pdf', ''));
    }
  };

  const handleResumeUpload = async () => {
    if (!newResumeFile || !newResumeName.trim()) {
      toast.error('Please select a file and enter a name');
      return;
    }

    setUploadingResume(true);
    try {
      await resumeService.create(newResumeFile, newResumeName.trim(), isDefaultResume);
      toast.success('Resume uploaded successfully');
      setNewResumeFile(null);
      setNewResumeName('');
      setIsDefaultResume(false);
      // Reset file input
      const fileInput = document.getElementById('new-resume-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      await loadResumes();
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    try {
      await resumeService.delete(resumeId);
      toast.success('Resume deleted successfully');
      await loadResumes();
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleSetDefault = async (resumeId: number) => {
    try {
      await resumeService.setDefault(resumeId);
      toast.success('Default resume updated');
      await loadResumes();
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const getResumeUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http')) return fileUrl;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5126/api';
    const baseUrl = apiUrl.replace('/api', '');
    // Resumes are stored in Documents/Resumes folder
    return `${baseUrl}/documents/Resumes/${fileUrl}`;
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

  if (!candidate) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Candidate profile not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your profile information and skills</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...register('firstName')} disabled={updating} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} disabled={updating} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={candidate.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...register('phoneNumber')} disabled={updating} />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
                )}
              </div>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Management</CardTitle>
            <CardDescription>Upload and manage multiple resumes. Select which resume to use when applying for jobs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload New Resume Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">Upload New Resume</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="new-resume-file">Select PDF File</Label>
                  <Input
                    id="new-resume-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeFileSelect}
                    disabled={uploadingResume}
                    className="cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-resume-name">Resume Name</Label>
                  <Input
                    id="new-resume-name"
                    placeholder="e.g., Software Engineer Resume, Marketing Resume"
                    value={newResumeName}
                    onChange={(e) => setNewResumeName(e.target.value)}
                    disabled={uploadingResume}
                  />
                  <p className="text-xs text-muted-foreground">
                    Give your resume a descriptive name to easily identify it
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="set-default"
                    checked={isDefaultResume}
                    onChange={(e) => setIsDefaultResume(e.target.checked)}
                    disabled={uploadingResume}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="set-default" className="text-sm font-normal cursor-pointer">
                    Set as default resume
                  </Label>
                </div>
                <Button
                  onClick={handleResumeUpload}
                  disabled={!newResumeFile || !newResumeName.trim() || uploadingResume}
                  className="w-full"
                >
                  {uploadingResume ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resume
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Resumes List */}
            <div className="space-y-3">
              <h3 className="font-semibold">Your Resumes ({resumes.length})</h3>
              {loadingResumes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No resumes uploaded yet</p>
                  <p className="text-sm">Upload your first resume above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{resume.name}</span>
                            {resume.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {resume.fileName} • Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!resume.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(resume.id)}
                            title="Set as default"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getResumeUrl(resume.fileUrl), '_blank')}
                          title="View resume"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              title="Delete resume"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{resume.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteResume(resume.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Select your skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selected Skills Section */}
            {selectedSkills.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Your Selected Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {allSkills
                    .filter((skill) => selectedSkills.includes(skill.id))
                    .map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="default"
                        className="px-3 py-1.5 text-sm flex items-center gap-2"
                      >
                        {skill.name}
                        <button
                          onClick={async () => {
                            const previousSkills = [...selectedSkills];
                            const newSkills = selectedSkills.filter((id) => id !== skill.id);
                            setSelectedSkills(newSkills);
                            await handleSkillsUpdate(newSkills, previousSkills);
                          }}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${skill.name}`}
                          disabled={savingSkills}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Search and Add Skills Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {selectedSkills.length > 0 ? 'Add More Skills' : 'Select Your Skills'}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills to add..."
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Available Skills List */}
              {(() => {
                // Only show results if user has typed at least 2 characters
                if (skillSearchQuery.length < 2) {
                  return (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Type at least 2 characters to search for skills
                    </p>
                  );
                }

                const unselectedSkills = allSkills.filter(
                  (skill) =>
                    !selectedSkills.includes(skill.id) &&
                    skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
                );

                if (unselectedSkills.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No skills found matching "{skillSearchQuery}"
                    </p>
                  );
                }

                return (
                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {unselectedSkills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="outline"
                          className="px-3 py-1.5 text-sm cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={async () => {
                            const previousSkills = [...selectedSkills];
                            const newSkills = [...selectedSkills, skill.id];
                            setSelectedSkills(newSkills);
                            setSkillSearchQuery('');
                            await handleSkillsUpdate(newSkills, previousSkills);
                          }}
                          style={{ pointerEvents: savingSkills ? 'none' : 'auto' }}
                        >
                          + {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {savingSkills && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving skills...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

