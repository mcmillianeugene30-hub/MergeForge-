import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ArtifactViewer({ artifact }: { artifact: any }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{artifact?.path || "Artifact viewer"}</CardTitle>
      </CardHeader>
      <CardContent>
        {artifact ? (
          <pre className="max-h-[700px] overflow-auto rounded-xl border bg-muted/40 p-4 text-xs">
            <code>{artifact.content}</code>
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">Select an artifact.</p>
        )}
      </CardContent>
    </Card>
  );
}
