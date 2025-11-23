import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { authService } from '@/services/authService';
import { countryService } from '@/services/countryService';
import { cityService } from '@/services/cityService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { Country, City } from '@/types';

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  website: z.string().url('Invalid website URL'),
  location: z.string().min(2, 'Location is required'),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()),
  numberOfEmployees: z.number().min(1),
  countryId: z.number().min(1, 'Please select a country'),
  cityId: z.number().min(1, 'Please select a city'),
  logo: z.instanceof(FileList).refine((files) => files.length > 0, 'Logo is required'),
});

type CompanyFormData = z.infer<typeof companySchema>;

export default function RegisterCompanyForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await countryService.getAll();
        setCountries(data);
      } catch (error) {
        toast.error('Failed to load countries');
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const countryId = watch('countryId');

  useEffect(() => {
    const fetchCities = async () => {
      if (!countryId) {
        setCities([]);
        setValue('cityId', undefined as any, { shouldValidate: false });
        return;
      }
      setLoadingCities(true);
      try {
        const data = await cityService.getByCountryId(countryId);
        setCities(data);
        setValue('cityId', undefined as any, { shouldValidate: false });
      } catch (error) {
        toast.error('Failed to load cities');
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [countryId, setValue]);

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('CompanyName', data.companyName);
      formData.append('Email', data.email);
      formData.append('PhoneNumber', data.phoneNumber);
      formData.append('Password', data.password);
      formData.append('Description', data.description);
      formData.append('Website', data.website);
      formData.append('Location', data.location);
      formData.append('FoundedYear', data.foundedYear.toString());
      formData.append('NumberOfEmployees', data.numberOfEmployees.toString());
      if (data.countryId) {
        formData.append('CountryId', data.countryId.toString());
      }
      if (data.cityId) {
        formData.append('CityId', data.cityId.toString());
      }
      formData.append('file', data.logo[0]);

      const response = await authService.registerCompany(formData);
      toast.success(response.message);
      navigate('/verify-email', { state: { email: response.email, code: response.confirmationCode } });
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input
          id="companyName"
          {...register('companyName')}
          disabled={isLoading}
          placeholder="Acme Inc."
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
          placeholder="contact@company.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          {...register('phoneNumber')}
          disabled={isLoading}
          placeholder="+1234567890"
        />
        {errors.phoneNumber && (
          <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
          placeholder="Minimum 12 characters"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          disabled={isLoading}
          placeholder="Tell us about your company..."
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            {...register('website')}
            disabled={isLoading}
            placeholder="https://company.com"
          />
          {errors.website && (
            <p className="text-sm text-destructive">{errors.website.message}</p>
          )}
        </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="foundedYear">Founded Year</Label>
          <Input
            id="foundedYear"
            type="number"
            {...register('foundedYear', { valueAsNumber: true })}
            disabled={isLoading}
            placeholder="2020"
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
            disabled={isLoading}
            placeholder="50"
          />
          {errors.numberOfEmployees && (
            <p className="text-sm text-destructive">{errors.numberOfEmployees.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="countryId">Country</Label>
          <Select
            value={countryId?.toString()}
            onValueChange={(value) => setValue('countryId', parseInt(value), { shouldValidate: true })}
            disabled={isLoading || loadingCountries}
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
            value={watch('cityId')?.toString()}
            onValueChange={(value) => setValue('cityId', parseInt(value), { shouldValidate: true })}
            disabled={isLoading || loadingCities || !countryId}
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

        <div className="space-y-2 col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            disabled={isLoading}
            placeholder="Location"
          />
          {errors.location && (
            <p className="text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo">Company Logo</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          {...register('logo')}
          disabled={isLoading}
          className="cursor-pointer"
        />
        {errors.logo && (
          <p className="text-sm text-destructive">{errors.logo.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || loadingCountries}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          'Register as Company'
        )}
      </Button>
    </form>
  );
}

