import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { candidateService } from '@/services/candidateService';
import type { CandidateDto } from '@/types';
import { toast } from 'sonner';
import { Loader2, Briefcase, FileText, TrendingUp, CheckCircle, Settings, Mail, Phone } from 'lucide-react';

const candidateSidebarItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Applications', path: '/candidate/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Profile', path: '/candidate/profile', icon: <CheckCircle className="h-4 w-4" /> },
];

const companySidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

export default function PublicCandidateProfilePage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [candidate, setCandidate] = useState<CandidateDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;
      try {
        const candidateData = await candidateService.getById(id);
        setCandidate(candidateData);
      } catch (error) {
        toast.error('Failed to load candidate profile');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  const getSidebarItems = () => {
    if (!user) return [];
    if (user.role === 'Company') return companySidebarItems;
    if (user.role === 'Candidate') return candidateSidebarItems;
    return [];
  };

  const sidebarItems = getSidebarItems();
  const shouldUseDashboard = isAuthenticated && sidebarItems.length > 0;

  if (loading) {
    return shouldUseDashboard ? (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    ) : (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return shouldUseDashboard ? (
      <DashboardLayout sidebarItems={sidebarItems}>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Candidate profile not found</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    ) : (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Candidate profile not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {candidate.firstName} {candidate.lastName}
        </h1>
        <p className="text-muted-foreground">Candidate Profile</p>
      </div>

      <div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.phoneNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {candidate.skills && candidate.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {candidate.resumeUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Resume
                </a>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );

  return shouldUseDashboard ? (
    <DashboardLayout sidebarItems={sidebarItems}>
      {content}
    </DashboardLayout>
  ) : (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {content}
      </div>
    </div>
  );
}

