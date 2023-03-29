import { JsiiProject } from 'projen/lib/cdk';
import { BundleKics } from './projenrc';

const project = new JsiiProject({
  author: 'Checkmarx',
  authorAddress: 'REPLACEME@checkmarx.com',
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
  release: false,
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
