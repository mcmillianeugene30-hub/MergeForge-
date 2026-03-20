import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ArtifactTree({
  forgeId,
  sessionId,
  artifacts
}: {
  forgeId: string;
  sessionId: string;
  artifacts: any[];
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Artifacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {artifacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No artifacts yet.</p>
        ) : (
          artifacts.map((artifact) => (
            <Link
              key={artifact.id}
              href={`/forge/${forgeId}/builder/${sessionId}?path=${encodeURIComponent(artifact.path)}`}
              className="block rounded-lg border p-2 text-sm hover:bg-muted/40"
            >
              {artifact.path}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
