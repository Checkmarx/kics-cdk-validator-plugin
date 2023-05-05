import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { copySync } from 'fs-extra';
import { getReleaseVersion } from './utils';
import { exec } from '../src/utils';

/**
 * Clone and checkout a specific version
 */
function cloneVersion(version: string): string | undefined {
  const tmpDir = fs.realpathSync(os.tmpdir());
  const kicsDir = path.join(tmpDir, `kics-${version}`);
  fs.rmSync(kicsDir, { recursive: true, force: true });
  exec([
    'git',
    'clone',
    'https://github.com/Checkmarx/kics.git',
    `kics-${version}`,
  ], {
    cwd: tmpDir,
  });
  exec(['git', 'checkout', version], { cwd: kicsDir });
  return kicsDir;
}

/**
 * build kics from source using
 * goreleaser
 */
function buildKics(dir: string) {
  exec([
    'goreleaser',
    'build',
    '--config',
    path.join(__dirname, 'templates', '.goreleaser.yml'),
    '--clean',
  ], { cwd: dir });
  const fileMap = [
    { source: 'kics_darwin_arm64', target: 'darwin_arm64' },
    { source: 'kics_darwin_amd64_v1', target: 'darwin_amd64' },
    { source: 'kics_linux_arm64', target: 'linux_arm64' },
    { source: 'kics_linux_amd64_v1', target: 'linux_amd64' },
    { source: 'kics_windows_arm64', target: 'windows_arm64', name: 'kics.exe' },
    { source: 'kics_windows_amd64_v1', target: 'windows_amd64', name: 'kics.exe' },
  ];
  fileMap.forEach(file => {
    fs.mkdirSync(path.join(__dirname, '..', 'bin', file.target ), { recursive: true });
    fs.copyFileSync(
      path.join(dir, 'dist', file.source, file.name ?? 'kics'),
      path.join(__dirname, '..', 'bin', file.target, file.name ?? 'kics'),
    );
  });
  fs.mkdirSync(path.join(__dirname, '../assets/queries'), { recursive: true });
  copySync(
    path.join(dir, 'assets/queries/cloudFormation'),
    path.join(__dirname, '..', 'assets/queries/cloudFormation'),
  );
  copySync(
    path.join(dir, 'assets/queries/common'),
    path.join(__dirname, '..', 'assets/queries/common'),
  );
  copySync(
    path.join(dir, 'assets/libraries'),
    path.join(__dirname, '..', 'assets', 'libraries'),
  );
}

/**
 * Get the latest release of cfn-guard from GitHub
 * and bundle it in the repo.
 */
export async function main() {
  const version = getReleaseVersion();
  if (!fs.existsSync(path.join(__dirname, '..', 'bin')) && version) {
    const downloadPath = cloneVersion(version);
    if (downloadPath) {
      buildKics(downloadPath);
    }
  }
}

main().catch(e => {
  console.log(e);
});
