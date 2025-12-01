// components/home/stats-section.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, Briefcase, TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatItem {
  id: string;
  judul: string;
  nilai: string;
  satuan?: string;
  icon: string;
  kategori: string;
}

interface StatsSectionProps {
  stats: StatItem[];
}

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  building: Building2,
  briefcase: Briefcase,
  trending: TrendingUp,
};

export function StatsSection({ stats }: StatsSectionProps) {
  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || TrendingUp;
    return Icon;
  };

  return (
    <section className="py-12 bg-linear-to-br from-merauke-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 max-w-7xl mx-auto">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">
            Statistik Kabupaten Merauke
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Data dan informasi terkini tentang perkembangan Kabupaten Merauke
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
          {stats.map((stat, index) => {
            const Icon = getIcon(stat.icon);

            return (
              <Card
                key={stat.id}
                className="group hover-lift border-0 shadow-xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {stat.nilai}
                      {stat.satuan && (
                        <span className="text-lg text-muted-foreground ml-1">
                          {stat.satuan}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.judul}
                  </div>
                </CardContent>

                {/* Decorative Element */}
                <div className="h-1 bg-gradient-primary" />
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Data terakhir diperbarui:{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

// Alternative Minimal Stats
export function StatsMinimal({ stats }: StatsSectionProps) {
  return (
    <section className="py-12 border-y border-border/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon] || TrendingUp;

            return (
              <div key={stat.id} className="text-center group">
                <Icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-primary mb-1">
                  {stat.nilai}
                  {stat.satuan && (
                    <span className="text-lg text-muted-foreground ml-1">
                      {stat.satuan}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.judul}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Counter Animation Component (optional enhancement)
export function AnimatedCounter({
  value,
  duration = 2000,
}: {
  value: string;
  duration?: number;
}) {
  // This would use client-side animation to count up to the value
  // Implementation would require useEffect and useState
  return <span>{value}</span>;
}

// Loading Skeleton
export function StatsSectionSkeleton() {
  return (
    <section className="py-12 bg-linear-to-br from-merauke-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container">
        <div className="text-center mb-10">
          <div className="h-8 w-64 mx-auto skeleton mb-3" />
          <div className="h-4 w-96 mx-auto skeleton" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <div className="h-14 w-14 rounded-xl skeleton" />
                <div className="h-8 w-24 skeleton" />
                <div className="h-4 w-32 skeleton" />
              </CardContent>
              <div className="h-1 skeleton" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
