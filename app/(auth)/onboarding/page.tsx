import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: githubAccount } = await supabase
    .from("github_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center px-6">
      <div className="grid w-full gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Connect GitHub</CardTitle>
            <CardDescription>
              Link your GitHub account to import repos, issues, and PRs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {githubAccount ? (
              <p className="text-sm text-muted-foreground">
                Connected as <span className="font-medium">{githubAccount.github_login}</span>
              </p>
            ) : (
              <Button asChild>
                <Link href="/api/github/auth">Connect GitHub</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Create your first Forge</CardTitle>
            <CardDescription>
              Set up a project workspace and start linking repositories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
