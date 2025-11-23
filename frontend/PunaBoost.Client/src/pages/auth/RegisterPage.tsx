import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAppSelector } from '@/store/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RegisterCandidateForm from '@/components/auth/RegisterCandidateForm';
import RegisterCompanyForm from '@/components/auth/RegisterCompanyForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'Company') {
        navigate('/company/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <Link 
            to="/" 
            className="text-3xl font-bold text-primary hover:text-primary/80 transition-colors inline-block"
          >
            PunaBoost
          </Link>
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join PunaBoost as a candidate or company
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Tabs defaultValue="candidate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>
            <TabsContent value="candidate">
              <RegisterCandidateForm />
            </TabsContent>
            <TabsContent value="company">
              <RegisterCompanyForm />
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in here
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

