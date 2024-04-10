import { JsiiProject } from 'projen/lib/cdk';
import { Job } from 'projen/lib/github/workflows-model';
import { ReleaseTrigger } from 'projen/lib/release';
import { BundleKics } from './projenrc';

const jobConfig = {
  name: 'Trivy Scan',
  runsOn: ['ubuntu-20.04'],
  permissions: {}, // Placeholder for permissions
  steps: [
    {
      name: 'Checkout code',
      uses: 'actions/checkout@v4',
    },
    {
      name: 'Run Trivy vulnerability scanner in repo mode',
      uses: 'aquasecurity/trivy-action@master',
      with: {
        'scan-type': 'fs',
        'ignore-unfixed': true,
        'format': 'json',
        'output': './trivy-results.json',
        'severity': 'CRITICAL,HIGH,MEDIUM',
        'exit-code': '1',
      },
    },
    {
      name: 'Inspect action report',
      if: 'always()',
      shell: 'bash',
      run: 'cat ./trivy-results.json',
    },
    {
      if: 'always()',
      name: 'Upload artifact',
      uses: 'actions/upload-artifact@v2',
      with: {
        name: 'trivy code report',
        path: './trivy-results.json',
      },
    },
  ],
};

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
    'constructs',
    'aws-cdk-lib',
  ],
  name: '@checkmarx/cdk-validator-kics',
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
  majorVersion: 1,
});

project.tsconfig?.addInclude('projenrc/**/*.ts');
project.gitignore.exclude('bin');
project.gitignore.exclude('assets');

// Super hacky way to add a step to a workflow that projen itself generates
const buildWorkflow = project.github?. tryFindWorkflow('build');

if (buildWorkflow != null) {
  const buildJob = buildWorkflow.getJob('build');
  if (isJob(buildJob)) {
    buildWorkflow.addJob('secchecks', { ...jobConfig });
    buildWorkflow.updateJob('build', {
      ...buildJob,
      steps: [
        {
          uses: 'actions/setup-go@v5',
          with: { 'go-version': '1.22.x' },
        },
        { run: 'go install github.com/goreleaser/goreleaser@latest' },
        {
          name: 'Add goreleaser to PATH',
          run: 'echo "PATH=$(go env GOPATH)/bin:$PATH" >> $GITHUB_ENV',
        },
        ...(buildJob.steps as any)(),
      ],
    });
  }
}

// Super hacky way to add a step to a workflow that projen itself generates
const releaseWorkflow = project.github?. tryFindWorkflow('release');

if (releaseWorkflow != null) {
  const releaseJob = releaseWorkflow.getJob('release');
  if (isJob(releaseJob)) {
    releaseWorkflow.updateJob('release', {
      ...releaseJob,
      steps: [
        {
          uses: 'actions/setup-go@v5',
          with: { 'go-version': '1.22.x' },
        },
        { run: 'go install github.com/goreleaser/goreleaser@latest' },
        {
          name: 'Add goreleaser to PATH',
          run: 'echo "PATH=$(go env GOPATH)/bin:$PATH" >> $GITHUB_ENV',
        },
        ...releaseJob.steps,
      ],
    });
  }
}

new BundleKics(project);
project.synth();

function isJob(job: any): job is Job {
  return job != null && job.hasOwnProperty('steps');
}
