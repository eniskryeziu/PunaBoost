import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title = 'No items found',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          {icon && <div className="mb-4 flex justify-center">{icon}</div>}
          {title && <p className={cn('text-lg font-semibold mb-2', icon ? '' : 'text-muted-foreground')}>{title}</p>}
          {description && <p className="text-muted-foreground mb-6">{description}</p>}
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

