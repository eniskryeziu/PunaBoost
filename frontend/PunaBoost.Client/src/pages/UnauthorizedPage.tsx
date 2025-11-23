import { Link } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Unauthorized Access</CardTitle>
              <CardDescription>
                You don't have permission to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please contact an administrator if you believe this is an error.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/">
                  <Button>Go Home</Button>
                </Link>
                <Link to="/jobs">
                  <Button variant="outline">Browse Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

