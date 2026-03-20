import { Octokit } from "@octokit/rest";

export function getOctokit(token: string) {
  return new Octokit({ auth: token });
}

export async function listAllRepos(token: string) {
  const octokit = getOctokit(token);
  const repos = await octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, {
    per_page: 100,
    affiliation: "owner,collaborator,organization_member",
    sort: "updated"
  });
  return repos.map((repo) => ({
    id: repo.id,
    full_name: repo.full_name,
    private: repo.private,
    default_branch: repo.default_branch
  }));
}
