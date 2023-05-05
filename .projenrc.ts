import { JsiiProject } from 'projen/lib/cdk';
import { BundleKics } from './projenrc';
import { ReleaseTrigger } from 'projen/lib/release';

const project = new JsiiProject({
  author: 'Checkmarx',
  authorAddress: 'kics@checkmarx.com',
  defaultReleaseBranch: 'main',
  devDeps: [
    'cdklabs-projen-project-types',
    '@octokit/types',
    '@octokit/rest',
    'mock-fs',
    '@types/mock-fs',
    'fs-extra',
    '@types/fs-extra',
  ],
  name: 'kics-cdk-validator-plugin',
  projenrcTs: true,
  release: true,
  releaseTrigger: ReleaseTrigger.continuous(),
  repositoryUrl: 'https://github.com/Checkmarx/kics-cdk-validator-plugin.git',
  deps: [
    'aws-cdk-lib',
  ],
  peerDeps: [
    'aws-cdk-lib',
  ],
  description: 'A KICS plugin for AWS CDK',
});

project.tsconfig?.addInclude('projenrc/**/*.ts');
project.gitignore.exclude('bin');
project.gitignore.exclude('assets');

new BundleKics(project);
project.synth();
