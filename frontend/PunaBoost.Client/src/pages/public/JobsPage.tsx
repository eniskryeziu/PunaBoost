import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Navbar from '@/components/layout/Navbar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { jobService } from '@/services/jobService';
import { industryService } from '@/services/industryService';
import { countryService } from '@/services/countryService';
import { cityService } from '@/services/cityService';
import type { JobDto, Industry, Country, City } from '@/types';
import { toast } from 'sonner';
import { Loader2, Search, MapPin, Briefcase, FileText, TrendingUp, CheckCircle, Settings, Sparkles, Clock, Filter, X } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo } from '@/utils/dateUtils';

const candidateSidebarItems = [
  { label: 'Dashboard', path: '/candidate/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Applications', path: '/candidate/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Browse Jobs', path: '/jobs', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Profile', path: '/candidate/profile', icon: <CheckCircle className="h-4 w-4" /> },
  { label: 'Hire with AI', path: '/candidate/hire-with-ai', icon: <Sparkles className="h-4 w-4" /> },
];

const companySidebarItems = [
  { label: 'Dashboard', path: '/company/dashboard', icon: <Briefcase className="h-4 w-4" /> },
  { label: 'My Jobs', path: '/company/jobs', icon: <FileText className="h-4 w-4" /> },
  { label: 'Applications', path: '/company/applications', icon: <FileText className="h-4 w-4" /> },
  { label: 'Profile', path: '/company/profile', icon: <Settings className="h-4 w-4" /> },
];

export default function JobsPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isRemote, setIsRemote] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);

  // Redirect companies to their jobs page
  useEffect(() => {
    if (isAuthenticated && user?.role === 'Company') {
      window.location.href = '/company/jobs';
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, industriesData, countriesData] = await Promise.all([
          jobService.getAll(),
          industryService.getAll(),
          countryService.getAll(),
        ]);
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setIndustries(industriesData);
        setCountries(countriesData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load cities when country is selected
  useEffect(() => {
    const fetchCities = async () => {
      if (selectedCountry && selectedCountry !== 'all') {
        try {
          const citiesData = await cityService.getByCountryId(parseInt(selectedCountry));
          setCities(citiesData);
        } catch (error) {
          // Silently fail if cities can't be loaded
        }
      } else {
        setCities([]);
        setSelectedCity('all');
      }
    };
    fetchCities();
  }, [selectedCountry]);

  useEffect(() => {
    const filtered = jobs.filter((job) => {
      // Search filter
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      // Industry filter
      const matchesIndustry = 
        selectedIndustry === 'all' || 
        job.industryId?.toString() === selectedIndustry;

      // Country filter
      const matchesCountry = 
        selectedCountry === 'all' || 
        job.countryId?.toString() === selectedCountry;

      // City filter
      const matchesCity = 
        selectedCity === 'all' || 
        job.cityId?.toString() === selectedCity;

      // Remote filter
      const matchesRemote = !isRemote || job.isRemote === true;

      return matchesSearch && matchesIndustry && matchesCountry && matchesCity && matchesRemote;
    });
    setFilteredJobs(filtered);
  }, [searchTerm, jobs, selectedIndustry, selectedCountry, selectedCity, isRemote]);

  const clearFilters = () => {
    setSelectedIndustry('all');
    setSelectedCountry('all');
    setSelectedCity('all');
    setIsRemote(false);
  };

  const hasActiveFilters = selectedIndustry !== 'all' || selectedCountry !== 'all' || selectedCity !== 'all' || isRemote;

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

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
        <p className="text-muted-foreground">Find your next opportunity</p>
      </div>

      {/* Search and Filter Toggle */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0">
                {[selectedIndustry !== 'all' && 1, selectedCountry !== 'all' && 1, selectedCity !== 'all' && 1, isRemote && 1].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filter Jobs</h3>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Industry Filter */}
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger id="industry" className='w-full'>
                      <SelectValue placeholder="All Industries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id.toString()}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger id="country" className='w-full'>
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select 
                    value={selectedCity} 
                    onValueChange={setSelectedCity}
                    disabled={selectedCountry === 'all'}
                  >
                    <SelectTrigger id="city" className='w-full'>
                      <SelectValue placeholder={selectedCountry === 'all' ? "Select country first" : "All Cities"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id.toString()}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Remote Filter */}
                <div className="space-y-2">
                  <Label>Work Type</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="remote"
                      checked={isRemote}
                      onCheckedChange={(checked) => setIsRemote(checked === true)}
                    />
                    <Label
                      htmlFor="remote"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remote Only
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredJobs.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No jobs found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => {
                const daysLeft = getDaysUntilExpiration(job.expiresAt);
                const badgeInfo = getExpirationBadgeInfo(daysLeft);

                return (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block">
                  <Card className="hover:shadow-lg transition-shadow flex flex-col h-full cursor-pointer relative gap-2">
                    {/* Expiration Date Badge */}
                    {badgeInfo && (
                      <div className="absolute top-[6px] right-[6px] z-10">
                        <Badge 
                          variant={badgeInfo.variant}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Clock className="h-3 w-3" />
                          {badgeInfo.label}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3 mb-3">
                        {job.companyLogoUrl && (
                          <img
                            src={job.companyLogoUrl.startsWith('http') || job.companyLogoUrl.startsWith('data:') 
                              ? job.companyLogoUrl 
                              : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5126'}/documents/CompaniesLogo/${job.companyLogoUrl}`}
                            alt={job.companyName}
                            className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                          <CardDescription className="mt-1">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              <Link 
                                to={`/companies/${job.companyId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="truncate hover:text-primary hover:underline transition-colors"
                              >
                                {job.companyName}
                              </Link>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {job.companyCityName && job.companyCountryName 
                              ? `${job.companyCityName}, ${job.companyCountryName}`
                              : job.location}
                          </span>
                          {job.isRemote && <span className="ml-1">• Remote</span>}
                        </div>
                        <Badge variant="secondary" className="w-fit">
                          ${job.salaryFrom.toLocaleString()}{job.salaryTo ? ` - ${job.salaryTo.toLocaleString()}` : ''}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        {job.skills?.slice(0, 3).map((skill) => (
                          <Badge key={skill.skillId} variant="outline" className="text-xs">
                            {skill.skillName}
                          </Badge>
                        ))}
                        {job.skills && job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{job.skills.length - 3} more</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                );
              })
            )}
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

