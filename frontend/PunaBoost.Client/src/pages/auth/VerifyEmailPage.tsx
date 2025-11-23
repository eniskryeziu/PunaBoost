import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { enrichUserWithName } from '@/utils/userUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const state = location.state as { email?: string; code?: string } | null;
    if (state?.email) {
      setEmail(state.email);
      if (state.code) {
        setCode(state.code);
      }
    } else {
      // If no email in state, redirect to register
      navigate('/register');
    }
  }, [location, navigate]);

  const handleVerify = async () => {
    if (!email || !code) {
      toast.error('Email and code are required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyEmail(email, code);
      const baseUser = { email: response.email, role: response.role as 'Admin' | 'Candidate' | 'Company' };
      
      // Set credentials first to ensure token is available
      dispatch(
        setCredentials({
          user: baseUser,
          token: response.token,
        })
      );
      
      // Enrich user with name information (only for Candidate and Company, not Admin)
      if (response.role !== 'Admin') {
        try {
          // Small delay to ensure token is set in axios instance
          await new Promise(resolve => setTimeout(resolve, 100));
          const enrichedUser = await enrichUserWithName(baseUser);
          dispatch(
            setCredentials({
              user: enrichedUser,
              token: response.token,
            })
          );
        } catch (error) {
          // Silently fail - enrichment is optional
          console.error('Failed to enrich user:', error);
        }
      }
      toast.success('Email verified successfully!');
      
      // Redirect based on role
      if (response.role === 'Admin') {
        navigate('/admin/dashboard');
      } else if (response.role === 'Company') {
        navigate('/company/dashboard');
      } else {
        navigate('/candidate/dashboard');
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a verification code to {email || 'your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              disabled={isLoading}
              className="text-center text-lg tracking-widest"
            />
          </div>
          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={isLoading || !code || !email}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

