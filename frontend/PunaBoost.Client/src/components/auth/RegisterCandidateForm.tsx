import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const candidateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  resume: z.instanceof(FileList).refine((files) => files.length > 0, 'Resume is required'),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

export default function RegisterCandidateForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  });

  const onSubmit = async (data: CandidateFormData) => {
    // Validate PDF file
    const resumeFile = data.resume[0];
    if (resumeFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file for your resume');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('FirstName', data.firstName);
      formData.append('LastName', data.lastName);
      formData.append('Email', data.email);
      formData.append('PhoneNumber', data.phoneNumber);
      formData.append('Password', data.password);
      formData.append('file', resumeFile);

      const response = await authService.registerCandidate(formData);
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            disabled={isLoading}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            disabled={isLoading}
            placeholder="Doe"
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isLoading}
          placeholder="you@example.com"
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
        <Label htmlFor="resume">Resume (PDF)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="resume"
            type="file"
            accept=".pdf"
            {...register('resume')}
            disabled={isLoading}
            className="cursor-pointer"
          />
        </div>
        {errors.resume && (
          <p className="text-sm text-destructive">{errors.resume.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          'Register as Candidate'
        )}
      </Button>
    </form>
  );
}

