import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateForgeDialog } from "@/components/create-forge-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: forges } = await supabase
    .from("forges")
    .select("id, name, description, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Forges</h1>
          <p className="text-muted-foreground">
            Welcome back. Manage your unified multi-repo workspaces.
          </p>
        </div>
        <CreateForgeDialog />
      </div>

      {!forges?.length ? (
        <Card className="rounded-2xl border-dashed">
          <CardHeader>
            <CardTitle>No Forges yet</CardTitle>
            <CardDescription>
              Create your first Forge to start linking GitHub repositories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateForgeDialog />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {forges.map((forge) => (
            <Link key={forge.id} href={`/forge/${forge.id}`}>
              <Card className="h-full rounded-2xl transition hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{forge.name}</CardTitle>
                    <Badge variant={forge.status === "active" ? "default" : "secondary"}>
                      {forge.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {forge.description || "No description yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Forge owner: {user.email}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
