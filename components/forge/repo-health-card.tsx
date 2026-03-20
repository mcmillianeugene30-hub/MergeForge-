import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Repo = {
  id: string;
  github_repo_full_name: string;
  last_synced_at: string | null;
};

export function RepoHealthCard({ repos }: { repos: Repo[] }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Linked Repositories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No repositories linked yet.
          </p>
        ) : (
          repos.map((repo) => (
            <div key={repo.id} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <div className="font-medium">{repo.github_repo_full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {repo.last_synced_at
                    ? `Last synced ${new Date(repo.last_synced_at).toLocaleString()}`
                    : "Never synced"}
                </div>
              </div>
              <Badge variant="secondary">GitHub</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
