import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { JobDto } from '@/types';
import { MapPin, Briefcase, Clock } from 'lucide-react';
import { getDaysUntilExpiration, getExpirationBadgeInfo } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: JobDto;
  variant?: 'default' | 'compact';
  showCompanyLogo?: boolean;
  showExpirationBadge?: boolean;
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function JobCard({
  job,
  variant = 'default',
  showCompanyLogo = true,
  showExpirationBadge = true,
  actions,
  onClick,
  className,
}: JobCardProps) {
  const daysLeft = getDaysUntilExpiration(job.expiresAt);
  const badgeInfo = showExpirationBadge ? getExpirationBadgeInfo(daysLeft) : null;

  const location = job.companyCityName && job.companyCountryName
    ? `${job.companyCityName}, ${job.companyCountryName}`
    : job.location;

  const logoUrl = job.companyLogoUrl?.startsWith('http') || job.companyLogoUrl?.startsWith('data:')
    ? job.companyLogoUrl
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5126'}/documents/CompaniesLogo/${job.companyLogoUrl}`;

  return (
    <Link to={`/jobs/${job.id}`} className={cn('block', className)} onClick={onClick}>
      <Card className={cn(
        'flex flex-col hover:shadow-lg transition-shadow h-full',
        variant === 'compact' && 'gap-2'
      )}>
        {badgeInfo && (
          <div className="absolute top-[6px] right-[6px] z-10">
            <Badge variant={badgeInfo.variant} className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {badgeInfo.label}
            </Badge>
          </div>
        )}
        <CardHeader className={cn('pb-3', variant === 'compact' && 'pb-2')}>
          <div className="flex items-start gap-3 mb-3">
            {showCompanyLogo && job.companyLogoUrl && (
              <img
                src={logoUrl}
                alt={job.companyName}
                className="w-16 h-16 rounded-lg object-cover border flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className={cn('line-clamp-2', variant === 'compact' ? 'text-base' : 'text-lg')}>
                {job.title}
              </CardTitle>
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
              <span className="truncate">{location}</span>
              {job.isRemote && <span className="ml-1">• Remote</span>}
            </div>
            <Badge variant="secondary" className="w-fit">
              ${job.salaryFrom.toLocaleString()}{job.salaryTo ? ` - ${job.salaryTo.toLocaleString()}` : '+'}
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
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
          {actions && <div className="mt-4 pt-4 border-t">{actions}</div>}
        </CardContent>
      </Card>
    </Link>
  );
}

