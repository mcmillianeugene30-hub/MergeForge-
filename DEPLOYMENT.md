# MergeForge Deployment Guide

## Quick Deploy Checklist

### Pre-Deployment Setup

- [ ] Supabase project created at https://supabase.com
- [ ] Database migrations applied (run SQL files in order)
- [ ] GitHub OAuth app created at https://github.com/settings/applications/new
- [ ] Environment variables configured

### Vercel Deployment Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Production ready"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/mergeforge.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework preset: Next.js

3. **Environment Variables**
   Add these in Vercel Project Settings → Environment Variables:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-vercel-domain.vercel.app` |
   | `GITHUB_CLIENT_ID` | `your-github-client-id` |
   | `GITHUB_CLIENT_SECRET` | `your-github-client-secret` |
   | `OPENAI_API_KEY` | (optional) `sk-...` |
   | `GROQ_API_KEY` | (optional) `gsk-...` |

4. **Update GitHub OAuth Callback**
   - Go to GitHub OAuth app settings
   - Set Authorization callback URL to:
     ```
     https://your-vercel-domain.vercel.app/api/github/callback
     ```

5. **Deploy**
   - Click "Deploy" in Vercel
   - Wait for build to complete

### Post-Deployment Verification

- [ ] Home page loads correctly
- [ ] Login with GitHub works
- [ ] Can create a Forge
- [ ] Can link GitHub repositories
- [ ] Board shows issues correctly
- [ ] Realtime updates work
- [ ] Settings page loads

## Database Setup

Run these migrations in Supabase SQL Editor in order:

1. `202603190001_init_extensions.sql`
2. `202603190002_profiles_and_forges.sql`
3. `202603190003_github_integrations.sql`
4. `202603190004_unified_work_items.sql`
5. `202603190005_rls_policies.sql`
6. `202603190006_realtime_publications.sql`
7. `202603190007_board_fields.sql`
8. `202603190008_builder_tables.sql`

Then run `seed.sql` to set up the user trigger.

## Troubleshooting

### Build fails with "Missing Supabase environment variables"
- Ensure all env vars are set in Vercel project settings
- Redeploy after adding variables

### GitHub OAuth fails
- Check the callback URL matches exactly (including https)
- Verify Client ID and Secret are correct
- Ensure no trailing slashes in URLs

### Database RLS errors
- Run all migrations in order
- Verify seed.sql was executed
- Check Supabase logs for policy errors

### Realtime not working
- Check `202603190006_realtime_publications.sql` was run
- Verify Supabase Realtime is enabled in project settings

## Security Notes

- Never commit `.env.local` to git
- Use different GitHub OAuth apps for dev/prod
- Rotate Supabase service role key periodically
- Set up GitHub token expiration/rotation

## Support

For issues, check:
1. Vercel deployment logs
2. Supabase database logs
3. Browser console for client errors
