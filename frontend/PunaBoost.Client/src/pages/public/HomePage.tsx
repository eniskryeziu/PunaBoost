import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Building2, Search } from 'lucide-react';

export default function HomePage() {
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
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            Find Your Dream Job with{' '}
            <span className="text-primary">PunaBoost</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Connect talented candidates with top companies. Your next career opportunity is just a click away.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/jobs">
              <Button size="lg">Browse Jobs</Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose PunaBoost?</h2>
          <p className="text-muted-foreground">
            A modern platform designed for both job seekers and employers
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Briefcase className="h-10 w-10 text-primary mb-4" />
              <CardTitle>For Candidates</CardTitle>
              <CardDescription>
                Create your profile, upload your resume, and apply to jobs that match your skills
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-4" />
              <CardTitle>For Companies</CardTitle>
              <CardDescription>
                Post jobs, find qualified candidates, and manage applications all in one place
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>
                Our platform matches candidates with jobs based on skills and preferences
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">Ready to Get Started?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Join thousands of candidates and companies already using PunaBoost
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Create Account
              </Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

