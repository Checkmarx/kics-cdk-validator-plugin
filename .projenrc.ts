import { JsiiProject } from 'projen/lib/cdk';
import { BundleKics } from './projenrc';
import { ReleaseTrigger } from 'projen/lib/release';
import { Job } from 'projen/lib/github/workflows-model';

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

// Super hacky way to add a step to a workflow that projen itself generates
const buildWorkflow = project.github?.workflows
  .find(wf => wf.name === 'build');

if (buildWorkflow != null) {
  const buildJob = buildWorkflow.getJob('build');
  if (isJob(buildJob)) {
    buildWorkflow.updateJob('build', {
      ...buildJob,
      steps: [
        { uses: 'actions/setup-go@v3' },
        { run: 'go install github.com/goreleaser/goreleaser@latest' },
        ...(buildJob.steps as any)()
      ],
    });
  }
}

new BundleKics(project);
project.synth();

function isJob(job: any): job is Job {
  return job != null && job.hasOwnProperty('steps');
}
