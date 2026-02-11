import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PageHeader, SectionHeader } from '@/components/shared';

const monthlyStats = [
  { label: 'Occupancy', value: 82 },
  { label: 'Avg. daily rate', value: 74 },
  { label: 'Guest satisfaction', value: 91 },
];

const topExperiences = [
  { name: 'Reef Snorkeling', score: '+18% demand' },
  { name: 'Sunset Chef Table', score: '+14% demand' },
  { name: 'Lagoon Meditation', score: '+9% demand' },
];

export default function AdminReportsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports"
        description="Trends, demand signals, and performance insights."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Monthly performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {monthlyStats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>{stat.label}</span>
                  <span className="text-foreground">{stat.value}%</span>
                </div>
                <Progress value={stat.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/60">
          <CardHeader>
            <CardTitle className="text-lg">Top experiences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {topExperiences.map((experience) => (
              <div key={experience.name} className="flex items-center justify-between">
                <span>{experience.name}</span>
                <span className="text-foreground">{experience.score}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        title="Insights"
        description="Wellness itineraries are trending for extended stays this season."
      />
    </div>
  );
}
