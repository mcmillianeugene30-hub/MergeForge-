import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BuilderSessionList({
  forgeId,
  sessions
}: {
  forgeId: string;
  sessions: any[];
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Builder Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions yet.</p>
        ) : (
          sessions.map((session) => (
            <Link
              key={session.id}
              href={`/forge/${forgeId}/builder/${session.id}`}
              className="block rounded-xl border p-3 hover:bg-muted/40"
            >
              <div className="font-medium">{session.prompt}</div>
              <div className="text-xs text-muted-foreground">
                {session.status} • {new Date(session.created_at).toLocaleString()}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
