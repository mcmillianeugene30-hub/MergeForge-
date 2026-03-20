import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OverviewStats({
  stats
}: {
  stats: {
    repos: number;
    openIssues: number;
    openPrs: number;
    milestones: number;
  };
}) {
  const items = [
    { label: "Linked Repos", value: stats.repos },
    { label: "Open Issues", value: stats.openIssues },
    { label: "Open PRs", value: stats.openPrs },
    { label: "Milestones", value: stats.milestones }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
