import { getOctokit } from "@/lib/github";

const IMPORTANT_FILES = [
  "package.json",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "requirements.txt",
  "pyproject.toml",
  "Dockerfile",
  "docker-compose.yml",
  ".env.example",
  ".env.local.example",
  "README.md",
  "next.config.js",
  "next.config.ts",
  "tsconfig.json",
  "tailwind.config.js",
  "tailwind.config.ts",
  "supabase/config.toml"
];

export async function getRepoTreeRecursive(
  token: string,
  owner: string,
  repo: string,
  branch?: string
) {
  const octokit = getOctokit(token);

  const repoMeta = await octokit.rest.repos.get({ owner, repo });
  const ref = branch || repoMeta.data.default_branch;

  const branchData = await octokit.rest.repos.getBranch({
    owner,
    repo,
    branch: ref
  });

  const treeSha = branchData.data.commit.commit.tree.sha;

  const tree = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: "true"
  });

  return tree.data.tree ?? [];
}

export async function getImportantFilesFromRepo(
  token: string,
  owner: string,
  repo: string,
  branch?: string
) {
  const octokit = getOctokit(token);

  const tree = await getRepoTreeRecursive(token, owner, repo, branch);

  const matching = tree.filter(
    (item) =>
      item.type === "blob" &&
      item.path &&
      IMPORTANT_FILES.some((f) => item.path === f || item.path.endsWith(`/${f}`))
  );

  const files: Array<{ path: string; content: string }> = [];

  for (const item of matching.slice(0, 25)) {
    if (!item.sha || !item.path) continue;

    const blob = await octokit.rest.git.getBlob({
      owner,
      repo,
      file_sha: item.sha
    });

    const content =
      blob.data.encoding === "base64"
        ? Buffer.from(blob.data.content, "base64").toString("utf8")
        : blob.data.content;

    files.push({
      path: item.path,
      content
    });
  }

  return {
    tree: tree.map((t) => ({
      path: t.path,
      type: t.type,
      sha: t.sha,
      size: "size" in t ? t.size : null
    })),
    files
  };
}

export function extractPackageSignals(
  files: Array<{ path: string; content: string }>
) {
  const dependencies = new Set<string>();
  const envVars = new Set<string>();
  const services = new Set<string>();
  const routes = new Set<string>();

  for (const file of files) {
    if (file.path.endsWith("package.json")) {
      try {
        const json = JSON.parse(file.content);
        for (const dep of Object.keys(json.dependencies || {})) dependencies.add(dep);
        for (const dep of Object.keys(json.devDependencies || {})) dependencies.add(dep);
      } catch {}
    }

    if (file.path.toLowerCase().includes("env")) {
      const matches = file.content.match(/[A-Z][A-Z0-9_]+/g) || [];
      matches.forEach((v) => envVars.add(v));
    }

    if (file.content.includes("supabase")) services.add("supabase");
    if (file.content.includes("next")) services.add("next.js");
    if (file.content.includes("octokit")) services.add("github-api");
    if (file.content.includes("openai")) services.add("openai");
    if (file.content.includes("groq")) services.add("groq");

    const routeMatches =
      file.content.match(/app\/api\/[A-Za-z0-9/_-]+|pages\/api\/[A-Za-z0-9/_-]+/g) || [];
    routeMatches.forEach((r) => routes.add(r));
  }

  return {
    dependencies: Array.from(dependencies).sort(),
    envVars: Array.from(envVars).sort(),
    services: Array.from(services).sort(),
    routes: Array.from(routes).sort()
  };
}
