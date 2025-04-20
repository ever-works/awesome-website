const { loadEnvConfig } = require("@next/env");
const git = require("isomorphic-git")
const http = require("isomorphic-git/http/node")
const fs = require("fs")
const path = require("path")
const os = require('os')

loadEnvConfig(process.cwd());

const token = process.env.GH_TOKEN;
const url = process.env.DATA_REPOSITORY;

if (!url) {
  throw new Error("'DATA_REPOSITORY' must be defined as environment variable.");
}

if (!token) {
  throw new Error("'GH_TOKEN' must be defined as environment variable.");
}


function getContentPath() {
  const contentDir = '.content';
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), contentDir);
  }

  return path.join(process.cwd(), contentDir);
}

const auth = { username: "x-access-token", password: token };
const dest = getContentPath();

async function main() {
  await fs.promises.mkdir(dest, { recursive: true });

  await git.clone({
    onAuth: () => auth,
    fs,
    http,
    url,
    dir: dest,
    singleBranch: true,
  });
}

main().catch(err => {
  console.error('Failed to clone repository:', err);
  process.exit(1);
});