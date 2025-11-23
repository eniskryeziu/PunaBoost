import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { companyService } from '@/services/companyService';
import { countryService } from '@/services/countryService';
import { cityService } from '@/services/cityService';
import type { CompanyDto, CompanyUpdateDto, Country, City } from '@/types';
import { Briefcase, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';

const sidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

const profileSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  website: z.string().url('Invalid website URL'),
  location: z.string().min(2, 'Location is required'),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()),
  numberOfEmployees: z.number().min(1),
  linkedIn: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  countryId: z.number().optional(),
  cityId: z.number().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const isInitialLoad = useRef(true);

  // Helper function to get logo URL
  const getLogoUrl = (logoUrl: string | undefined): string => {
    if (!logoUrl) return '';
    // If it's already a full URL or base64, return as is
    if (logoUrl.startsWith('http') || logoUrl.startsWith('data:')) {
      return logoUrl;
    }
    // Otherwise, construct the API URL
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5126';
    // Remove /api from base URL if present
    const baseUrl = apiBaseUrl.replace('/api', '');
    return `${baseUrl}/documents/CompaniesLogo/${logoUrl}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companyData, countriesData] = await Promise.all([
          companyService.getMyCompany(),
          countryService.getAll(),
        ]);
        setCountries(countriesData);

        if (companyData) {
          setCompany(companyData);
        } else {
          toast.error('Company profile not found');
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      description: '',
      website: '',
      location: '',
      foundedYear: new Date().getFullYear(),
      numberOfEmployees: 1,
      linkedIn: '',
      countryId: undefined,
      cityId: undefined,
    },
  });

  const countryId = watch('countryId');
  const cityId = watch('cityId');

  useEffect(() => {
    if (company && countries.length > 0) {
      // First, reset form with company data
      reset({
        companyName: company.companyName,
        description: company.description,
        website: company.website,
        location: company.location,
        foundedYear: company.foundedYear,
        numberOfEmployees: company.numberOfEmployees,
        linkedIn: company.linkedIn || '',
        countryId: company.countryId,
        cityId: company.cityId,
      });

      // Ensure countryId is set after countries are loaded and form is reset
      if (company.countryId) {
        const countryExists = countries.some(country => country.id === company.countryId);
        if (countryExists) {
          requestAnimationFrame(() => {
            setValue('countryId', company.countryId!, { shouldValidate: false });
          });
        }
      }

      // Fetch cities if company has a countryId (for initial load)
      if (company.countryId) {
        cityService.getByCountryId(company.countryId)
          .then(citiesData => {
            setCities(citiesData);
            // After cities are loaded, ensure cityId is set if it exists in the loaded cities
            if (company.cityId) {
              const cityExists = citiesData.some(city => city.id === company.cityId);
              if (cityExists) {
                // Use requestAnimationFrame to ensure DOM is updated before setting value
                requestAnimationFrame(() => {
                  setValue('cityId', company.cityId!, { shouldValidate: false });
                });
              }
            }
            // Mark initial load as complete after cities are loaded
            isInitialLoad.current = false;
          })
          .catch(() => {
            toast.error('Failed to load cities');
            isInitialLoad.current = false;
          });
      } else {
        setCities([]);
        isInitialLoad.current = false;
      }
    }
  }, [company, countries, reset, setValue]);

  useEffect(() => {
    // Skip on initial load - cities are loaded by the company useEffect
    if (isInitialLoad.current) {
      return;
    }

    const fetchCities = async () => {
      if (!countryId) {
        setCities([]);
        setValue('cityId', undefined, { shouldValidate: false });
        return;
      }
      try {
        const citiesData = await cityService.getByCountryId(countryId);
        setCities(citiesData);
        // Only reset cityId if the current city doesn't exist in the new country's cities
        if (cityId) {
          const cityExists = citiesData.some(city => city.id === cityId);
          if (!cityExists) {
            // City doesn't exist in new country, reset it
            setValue('cityId', undefined, { shouldValidate: false });
          }
          // If city exists, keep it selected (don't reset)
        }
      } catch (error) {
        toast.error('Failed to load cities');
      }
    };
    fetchCities();
  }, [countryId, setValue, cityId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.put(`/account/company/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh company data
      const updatedCompany = await companyService.getMyCompany();
      if (updatedCompany) {
        setCompany(updatedCompany);
      }
      toast.success('Logo updated successfully');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setUploadingLogo(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!company) return;

    setUpdating(true);
    try {
      const updateDto: CompanyUpdateDto = {
        companyName: data.companyName,
        description: data.description,
        website: data.website,
        location: data.location,
        foundedYear: data.foundedYear,
        numberOfEmployees: data.numberOfEmployees,
        linkedIn: data.linkedIn || undefined,
        countryId: data.countryId,
        cityId: data.cityId,
      };
      const updated = await companyService.update(company.id, updateDto);
      // Merge updated data with existing company data since backend might not return all fields
      const mergedCompany = { ...company, ...updated };
      setCompany(mergedCompany);
      // Refresh the form with updated data
      reset({
        companyName: mergedCompany.companyName || data.companyName,
        description: mergedCompany.description || data.description,
        website: mergedCompany.website || data.website,
        location: mergedCompany.location || data.location,
        foundedYear: mergedCompany.foundedYear || data.foundedYear,
        numberOfEmployees: mergedCompany.numberOfEmployees || data.numberOfEmployees,
        linkedIn: mergedCompany.linkedIn || data.linkedIn || '',
        countryId: mergedCompany.countryId || data.countryId,
        cityId: mergedCompany.cityId || data.cityId,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setUpdating(false);
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

  if (!company) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Company profile not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company information</p>
        </div>

        {/* Display Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
            <CardDescription>Your company information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Company Name</Label>
                <p className="text-lg font-semibold">{company.companyName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="text-lg">
                  {company.location || 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Country</Label>
                <p className="text-lg">{company.countryName || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">City</Label>
                <p className="text-lg">{company.cityName || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Founded Year</Label>
                <p className="text-lg">{company.foundedYear || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Number of Employees</Label>
                <p className="text-lg">{company.numberOfEmployees?.toLocaleString() || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Website</Label>
                <p className="text-lg">
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm md:text-base break-all">
                      {company.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
              {company.linkedIn && (
                <div>
                  <Label className="text-muted-foreground">LinkedIn</Label>
                  <p className="text-lg">
                    <a href={company.linkedIn} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm md:text-base break-all">
                      {company.linkedIn}
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-lg whitespace-pre-wrap">{company.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Logo Section */}
            <div className="space-y-4 mb-6 pb-6 border-b">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                {company.logoUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden border flex items-center justify-center bg-muted">
                    <img
                      src={getLogoUrl(company.logoUrl)}
                      alt={company.companyName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="cursor-pointer"
                  />
                  {uploadingLogo && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                      Uploading logo...
                    </p>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" {...register('companyName')} disabled={updating} />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  disabled={updating}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" {...register('website')} disabled={updating} />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" {...register('location')} disabled={updating} />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    {...register('foundedYear', { valueAsNumber: true })}
                    disabled={updating}
                  />
                  {errors.foundedYear && (
                    <p className="text-sm text-destructive">{errors.foundedYear.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfEmployees">Number of Employees</Label>
                  <Input
                    id="numberOfEmployees"
                    type="number"
                    {...register('numberOfEmployees', { valueAsNumber: true })}
                    disabled={updating}
                  />
                  {errors.numberOfEmployees && (
                    <p className="text-sm text-destructive">{errors.numberOfEmployees.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedIn">LinkedIn URL</Label>
                <Input
                  id="linkedIn"
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"
                  {...register('linkedIn')}
                  disabled={updating}
                />
                {errors.linkedIn && (
                  <p className="text-sm text-destructive">{errors.linkedIn.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="countryId">Country</Label>
                  <Select
                    key={`country-${countries.length}-${countryId || 'none'}`}
                    value={countryId && countries.some(c => c.id === countryId) ? countryId.toString() : ''}
                    onValueChange={(value) =>
                      setValue('countryId', value ? parseInt(value) : undefined, { shouldValidate: true })
                    }
                    disabled={updating}
                  >
                    <SelectTrigger className='w-full'>
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
                  <Label htmlFor="cityId">City</Label>
                  <Select
                    key={`city-${countryId || 'none'}-${cities.length}`}
                    value={cityId && cities.some(c => c.id === cityId) ? cityId.toString() : ''}
                    onValueChange={(value) =>
                      setValue('cityId', value ? parseInt(value) : undefined, { shouldValidate: true })
                    }
                    disabled={updating || !countryId}
                  >
                    <SelectTrigger className='w-full'>
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
      </div>
    </DashboardLayout>
  );
}

