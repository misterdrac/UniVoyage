import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/animations/AnimatedCounter';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconBgFrom: string;
  iconBgTo: string;
  iconColor: string;
  suffix?: string;
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  iconBgFrom,
  iconBgTo,
  iconColor,
  suffix,
}: StatCardProps) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground">
              <AnimatedCounter end={value} />
            </p>
            {suffix && (
              <p className="text-xs text-muted-foreground mt-0.5">{suffix}</p>
            )}
          </div>
          <div
            className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-300"
            style={{
              background: `linear-gradient(to bottom right, ${iconBgFrom}, ${iconBgTo})`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

