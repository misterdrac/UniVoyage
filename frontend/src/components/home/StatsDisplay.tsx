import { AnimatedCounter } from "@/components/animations";

interface Stat {
  end: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { end: 50, suffix: "+", label: "Destinations" },
  { end: 1000, suffix: "+", label: "Happy Students" },
  { end: 25, suffix: "+", label: "Countries" },
];

export function StatsDisplay() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {stats.map((stat) => (
        <div key={stat.label}>
          <AnimatedCounter
            end={stat.end}
            suffix={stat.suffix}
            className="text-xl font-bold text-primary"
          />
          <div className="text-xs text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
