import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("github_login")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium">Email</span>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium">Username</span>
              <p className="text-muted-foreground">{profile?.username || "Not set"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>GitHub Integration</CardTitle>
            <CardDescription>Manage your GitHub connection</CardDescription>
          </CardHeader>
          <CardContent>
            {githubAccount ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Connected as</span>
                  <p className="text-muted-foreground">{githubAccount.github_login}</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/api/github/auth">Reconnect</Link>
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/api/github/auth">Connect GitHub</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
