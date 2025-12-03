import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "danger" | "glow";
  trend?: {
    value: number;
    label: string;
  };
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
}: StatsCardProps) {
  return (
    <Card variant={variant} className="relative overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="data-label">{title}</p>
            <p className="text-3xl font-display font-bold text-glow-sm">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-mono",
                trend.value >= 0 ? "text-success" : "text-danger"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-lg transition-all duration-300 group-hover:scale-110",
            variant === "success" && "bg-success/20 text-success",
            variant === "warning" && "bg-warning/20 text-warning",
            variant === "danger" && "bg-danger/20 text-danger",
            variant === "glow" && "bg-primary/20 text-primary",
            variant === "default" && "bg-secondary text-primary"
          )}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  );
}
