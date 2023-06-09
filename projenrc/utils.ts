import * as fs from 'fs';
import * as path from 'path';
import { Octokit } from '@octokit/rest';
import { RequestHeaders, Endpoints } from '@octokit/types';
export interface Octo {
  readonly token: string;
  readonly octo: Octokit;
  readonly owner: string;
  readonly repo: string;
  readonly headers: RequestHeaders;
}
export type Release = Endpoints['GET /repos/{owner}/{repo}/releases/{release_id}']['response'];
export type ReleaseAsset = Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data']['assets'][0];

export function getReleaseVersion(): string | undefined {
  const filePath = path.join(__dirname, '../kics-version.json');
  if (fs.existsSync(filePath)) {
    const kicsVersion = fs.readFileSync(filePath).toString('utf-8').trim();
    return JSON.parse(kicsVersion).version;
  }
  return;
}

export function getReleaseId(): number | undefined {
  const filePath = path.join(__dirname, '../kics-version.json');
  if (fs.existsSync(filePath)) {
    const kicsVersion = fs.readFileSync(filePath).toString('utf-8').trim();
    return JSON.parse(kicsVersion).release_id;
  }
  return;
}

export function getOctokit(): Octo {
  if (!process.env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN needs to be set');
  }
  return {
    token: process.env.GITHUB_TOKEN,
    octo: new Octokit({ auth: process.env.GITHUB_TOKEN }),
    owner: 'Checkmarx',
    repo: 'kics',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };
}
