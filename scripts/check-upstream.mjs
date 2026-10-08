import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "thailand-geography-data/thailand-geography-json";
const BRANCH = "main";
const DEPENDENCY = "thailand-geography-json";

function extractPinnedSha(specifier) {
  if (!specifier) return null;

  const commitMatch = specifier.match(/#commit:([0-9a-f]{7,40})/i);
  if (commitMatch) return commitMatch[1].toLowerCase();

  const hashMatch = specifier.match(/#([0-9a-f]{40})$/i);
  if (hashMatch) return hashMatch[1].toLowerCase();

  return null;
}

async function readPinnedSha() {
  const packageJson = JSON.parse(
    await readFile(path.join(ROOT, "package.json"), "utf8")
  );
  const specifier =
    packageJson.dependencies?.[DEPENDENCY] ??
    packageJson.devDependencies?.[DEPENDENCY];

  const fromPackage = extractPinnedSha(specifier);
  if (fromPackage) {
    return { sha: fromPackage, source: "package.json", specifier };
  }

  try {
    const lockfile = await readFile(path.join(ROOT, "pnpm-lock.yaml"), "utf8");
    const block = lockfile.match(
      new RegExp(
        `${DEPENDENCY}@[^\\n]+:\\n(?: {2}[^\\n]+\\n)*? {2}resolution: \\{integrity: null, tarball: [^}]*\\}`,
        "m"
      )
    );
    const shaFromLock =
      lockfile.match(
        new RegExp(
          `${DEPENDENCY}@https://codeload\\.github\\.com/${REPO.replace("/", "\\/")}/tar\\.gz/([0-9a-f]{40})`,
          "i"
        )
      )?.[1] ??
      lockfile.match(
        new RegExp(`${DEPENDENCY}@[^\\n]*#([0-9a-f]{40})`, "i")
      )?.[1];

    if (shaFromLock) {
      return {
        sha: shaFromLock.toLowerCase(),
        source: "pnpm-lock.yaml",
        specifier: specifier ?? block?.[0] ?? "(lockfile)",
      };
    }
  } catch {
    // lockfile optional for the check itself
  }

  throw new Error(
    `Could not resolve a pinned commit for ${DEPENDENCY}. Pin with #<full-sha> in package.json.`
  );
}

async function fetchUpstreamHead() {
  const url = `https://api.github.com/repos/${REPO}/commits/${BRANCH}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "thailand-postcode-check-upstream",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API ${response.status} for ${url}: ${await response.text()}`
    );
  }

  const payload = await response.json();
  return {
    sha: String(payload.sha).toLowerCase(),
    message: String(payload.commit?.message ?? "").split("\n")[0],
    htmlUrl: payload.html_url,
  };
}

async function main() {
  const pinned = await readPinnedSha();
  const upstream = await fetchUpstreamHead();

  const short = (sha) => sha.slice(0, 7);
  const upToDate = pinned.sha === upstream.sha;

  const summary = [
    `dependency: ${DEPENDENCY}`,
    `pinned (${pinned.source}): ${short(pinned.sha)}`,
    `upstream ${BRANCH}: ${short(upstream.sha)} (${upstream.message})`,
    `status: ${upToDate ? "up to date" : "UPDATE AVAILABLE"}`,
  ].join("\n");

  console.log(summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    await (
      await import("node:fs/promises")
    ).appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `## Upstream geography data\n\n\`\`\`\n${summary}\n\`\`\`\n\n${
        upToDate
          ? "Pinned commit matches upstream `main`."
          : `Update with:\n\n\`\`\`bash\npnpm add thailand-geography-json@github:${REPO}#${upstream.sha}\npnpm test && pnpm build\n\`\`\`\n\n${upstream.htmlUrl}\n`
      }`
    );
  }

  if (upToDate) {
    process.exitCode = 0;
    return;
  }

  console.error(
    `\nNew geography data on ${BRANCH}. Bump the git SHA in package.json and re-test.`
  );
  console.error(
    `pnpm add ${DEPENDENCY}@github:${REPO}#${upstream.sha}`
  );
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
