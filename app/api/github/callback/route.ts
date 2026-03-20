import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error`);
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });

  const tokenJson = await tokenRes.json();

  if (!tokenJson.access_token) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error`);
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      Accept: "application/vnd.github+json"
    }
  });

  const ghUser = await userRes.json();

  await supabaseAdmin.from("github_accounts").upsert(
    {
      user_id: user.id,
      github_user_id: ghUser.id,
      github_login: ghUser.login,
      access_token: tokenJson.access_token,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "user_id"
    }
  );

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`);
}
