import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").at(-1)
  ?? "story-heart-evidence-detective";
const pagesBasePath = isGithubPages ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: pagesBasePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
