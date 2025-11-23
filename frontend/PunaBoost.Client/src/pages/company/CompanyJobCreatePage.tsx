import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { jobService } from '@/services/jobService';
import { industryService } from '@/services/industryService';
import { skillService } from '@/services/skillService';
import { countryService } from '@/services/countryService';
import { cityService } from '@/services/cityService';
import type { Industry, Skill, JobCreateDto, JobUpdateDto, Country, City } from '@/types';
import { useParams } from 'react-router';
import { Briefcase, FileText, Settings, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  salaryFrom: z.number().min(0, 'Minimum salary is required'),
  salaryTo: z.union([
    z.number().min(0, 'Maximum salary must be positive'),
    z.nan(),
  ]).transform((val) => isNaN(val) ? undefined : val).optional(),
  isRemote: z.boolean(),
  industryId: z.number().min(1, 'Industry is required'),
  countryId: z.number().min(1, 'Country is required'),
  cityId: z.number().min(1, 'City is required'),
  expiresAt: z.string().min(1, 'Expiration date is required'),
  skillIds: z.array(z.number()).optional(),
}).refine((data) => {
  // If salaryTo is provided, it must be >= salaryFrom
  if (data.salaryTo !== undefined && data.salaryTo !== null && data.salaryTo < data.salaryFrom) {
    return false;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salaryTo'],
}).refine((data) => {
  if (!data.expiresAt) return false;
  const expiresDate = new Date(data.expiresAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiresDate >= today;
}, {
  message: 'Expiration date must be today or in the future',
  path: ['expiresAt'],
});

type JobFormData = z.infer<typeof jobSchema>;

export default function CompanyJobCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      isRemote: false,
      skillIds: [],
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [industriesData, skillsData, countriesData] = await Promise.all([
          industryService.getAll(),
          skillService.getAll(),
          countryService.getAll(),
        ]);
        setIndustries(industriesData);
        setSkills(skillsData);
        setCountries(countriesData);

        if (isEditMode && id) {
          try {
            const jobData = await jobService.getById(id);
            setSelectedSkills(jobData.skills?.map(s => s.skillId) || []);
            setValue('title', jobData.title);
            setValue('description', jobData.description);
            setValue('location', jobData.location);
            setValue('salaryFrom', jobData.salaryFrom);
            setValue('salaryTo', jobData.salaryTo ?? undefined);
            setValue('isRemote', jobData.isRemote);
            setValue('industryId', jobData.industryId!);
            setValue('countryId', jobData.countryId!);
            setValue('cityId', jobData.cityId!);
            setValue('skillIds', jobData.skills?.map(s => s.skillId) || []);
            if (jobData.expiresAt) {
              const expiresDate = new Date(jobData.expiresAt);
              const year = expiresDate.getFullYear();
              const month = String(expiresDate.getMonth() + 1).padStart(2, '0');
              const day = String(expiresDate.getDate()).padStart(2, '0');
              setValue('expiresAt', `${year}-${month}-${day}`);
            }
            if (jobData.countryId) {
              try {
                const citiesData = await cityService.getByCountryId(jobData.countryId!);
                setCities(citiesData);
                if (jobData.cityId) {
                  setTimeout(() => {
                    setValue('cityId', jobData.cityId!, { shouldValidate: false });
                  }, 100);
                }
              } catch (error) {
                toast.error('Failed to load cities');
              }
            }
          } catch (error) {
            toast.error('Failed to load job data');
            navigate('/company/jobs');
          }
        }
      } catch (error) {
        toast.error('Failed to load form data');
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [id, isEditMode, setValue, navigate]);

  const countryId = watch('countryId');
  const cityId = watch('cityId');

  useEffect(() => {
    if (loadingData) {
      return;
    }

    const fetchCities = async () => {
      if (!countryId) {
        setCities([]);
        setValue('cityId', undefined as any, { shouldValidate: false });
        return;
      }
      try {
        const citiesData = await cityService.getByCountryId(countryId!);
        setCities(citiesData);
        if (cityId) {
          const cityExists = citiesData.some(city => city.id === cityId);
          if (!cityExists) {
            setValue('cityId', undefined as any, { shouldValidate: false });
          }
        }
      } catch (error) {
        toast.error('Failed to load cities');
      }
    };
    fetchCities();
  }, [countryId, cityId, setValue, loadingData]);

  const isRemote = watch('isRemote');
  const industryId = watch('industryId');

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);
    try {
      const salaryTo = data.salaryTo !== undefined && data.salaryTo !== null && !isNaN(data.salaryTo) && data.salaryTo > 0
        ? data.salaryTo
        : undefined;

      if (isEditMode && id) {
        const updateDto: JobUpdateDto = {
          title: data.title,
          description: data.description,
          location: data.location,
          salaryFrom: data.salaryFrom,
          salaryTo: salaryTo,
          isRemote: data.isRemote,
          industryId: data.industryId!,
          countryId: data.countryId!,
          cityId: data.cityId!,
          skillIds: data.skillIds || [],
          expiresAt: new Date(data.expiresAt),
        };
        await jobService.update(id, updateDto);
        toast.success('Job updated successfully!');
      } else {
        const jobDto: JobCreateDto = {
          title: data.title,
          description: data.description,
          location: data.location,
          salaryFrom: data.salaryFrom,
          salaryTo: salaryTo,
          isRemote: data.isRemote,
          industryId: data.industryId!,
          countryId: data.countryId!,
          cityId: data.cityId!,
          skillIds: data.skillIds || [],
          expiresAt: new Date(data.expiresAt),
        };
        await jobService.create(jobDto);
        toast.success('Job posted successfully!');
      }
      navigate('/company/jobs');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{isEditMode ? 'Edit Job' : 'Post New Job'}</h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Update job posting details' : 'Create a new job posting'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Fill in the information about the job position</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    {...register('title')}
                    disabled={loading}
                    placeholder="Software Engineer"
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <MarkdownEditor
                    value={watch('description') || ''}
                    onChange={(value) => setValue('description', value, { shouldValidate: true })}
                    disabled={loading}
                    placeholder="Job description and requirements... You can use Markdown formatting."
                    rows={12}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="countryId">Country <span className="text-destructive">*</span></Label>
                    <Select
                      value={countryId?.toString()}
                      onValueChange={(value) =>
                        setValue('countryId', parseInt(value), { shouldValidate: true })
                      }
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.countryId && (
                      <p className="text-sm text-destructive">{errors.countryId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityId">City <span className="text-destructive">*</span></Label>
                    <Select
                      value={cityId ? cityId.toString() : undefined}
                      onValueChange={(value) =>
                        setValue('cityId', parseInt(value), { shouldValidate: true })
                      }
                      disabled={loading || !countryId}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={countryId ? "Select a city" : "Select country first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cityId && (
                      <p className="text-sm text-destructive">{errors.cityId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                    <Input
                      id="location"
                      {...register('location')}
                      disabled={loading || isRemote}
                      placeholder="Location"
                      required
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industryId">Industry <span className="text-destructive">*</span></Label>
                    <Select
                      value={industryId?.toString()}
                      onValueChange={(value) =>
                        setValue('industryId', parseInt(value), { shouldValidate: true })
                      }
                      disabled={loading}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id.toString()}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.industryId && (
                      <p className="text-sm text-destructive">{errors.industryId.message}</p>
                    )}
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryFrom">Minimum Salary <span className="text-destructive">*</span></Label>
                    <Input
                      id="salaryFrom"
                      type="number"
                      {...register('salaryFrom', { valueAsNumber: true })}
                      disabled={loading}
                      placeholder="50000"
                      required
                    />
                    {errors.salaryFrom && (
                      <p className="text-sm text-destructive">{errors.salaryFrom.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryTo">Maximum Salary (Optional)</Label>
                    <Input
                      id="salaryTo"
                      type="number"
                      {...register('salaryTo', {
                        valueAsNumber: true,
                        setValueAs: (value) => {
                          if (value === '' || value === null || value === undefined) {
                            return undefined;
                          }
                          const num = Number(value);
                          return isNaN(num) ? undefined : num;
                        }
                      })}
                      disabled={loading}
                      placeholder="80000 (Optional)"
                    />
                    {errors.salaryTo && (
                      <p className="text-sm text-destructive">{errors.salaryTo.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRemote"
                      checked={isRemote}
                      onCheckedChange={(checked) => setValue('isRemote', checked as boolean)}
                      disabled={loading}
                    />
                    <Label htmlFor="isRemote" className="cursor-pointer">
                      Remote position
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAt">Expiration Date <span className="text-destructive">*</span></Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      {...register('expiresAt')}
                      disabled={loading}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {errors.expiresAt && (
                      <p className="text-sm text-destructive">{errors.expiresAt.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Skills (Optional)</Label>

                  {/* Selected Skills Section */}
                  {selectedSkills.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Selected Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {skills
                          .filter((skill) => selectedSkills.includes(skill.id))
                          .map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="default"
                              className="px-3 py-1.5 text-sm flex items-center gap-2"
                            >
                              {skill.name}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSkills = selectedSkills.filter((id) => id !== skill.id);
                                  setSelectedSkills(newSkills);
                                  setValue('skillIds', newSkills, { shouldValidate: true });
                                }}
                                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                aria-label={`Remove ${skill.name}`}
                                disabled={loading}
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
                    <Label className="text-sm font-semibold">
                      {selectedSkills.length > 0 ? 'Add More Skills' : 'Select Required Skills'}
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search skills to add..."
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="pl-9"
                        disabled={loading}
                      />
                    </div>

                    {(() => {
                      if (skillSearchQuery.length < 2) {
                        return (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            Type at least 2 characters to search for skills
                          </p>
                        );
                      }

                      const unselectedSkills = skills.filter(
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
                                onClick={() => {
                                  const newSkills = [...selectedSkills, skill.id];
                                  setSelectedSkills(newSkills);
                                  setSkillSearchQuery('');
                                  setValue('skillIds', newSkills, { shouldValidate: true });
                                }}
                                style={{ pointerEvents: loading ? 'none' : 'auto' }}
                              >
                                + {skill.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {errors.skillIds && (
                    <p className="text-sm text-destructive">{errors.skillIds.message}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Posting...'}
                      </>
                    ) : (
                      isEditMode ? 'Update Job' : 'Post Job'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/company/jobs')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

