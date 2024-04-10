import { Component } from 'projen';
import { JsiiProject } from 'projen/lib/cdk';
import { JobPermission } from 'projen/lib/github/workflows-model';

export class BundleKics extends Component {
  constructor(project: JsiiProject) {
    super(project);
    const updateTask = project.addTask('update-kics', {
      exec: 'ts-node projenrc/update-kics.ts',
    });
    const bundleTask = project.addTask('bundle-kics', {
      exec: 'ts-node projenrc/bundle-kics.ts',
    });
    updateTask.spawn(bundleTask);
    project.defaultTask?.spawn(bundleTask);

    const workflow = project.github?.addWorkflow('update-kics');
    workflow?.on({
      workflowDispatch: {},
      schedule: [{ cron: '0 9 * * THU' }],
    });
    workflow?.addJobs({
      update: {
        permissions: {
          contents: JobPermission.WRITE,
        },
        env: {
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
        },
        runsOn: ['ubuntu-latest'],
        steps: [
          { uses: 'actions/checkout@v3' },
          {
            uses: 'actions/setup-go@v5',
            with: { 'go-version': '1.22.x' },
          },
          { run: 'yarn install' },
          { run: 'go install github.com/goreleaser/goreleaser@latest' },
          { run: this.project.runTaskCommand(updateTask) },

          // create a pull request
          {
            uses: 'peter-evans/create-pull-request@v4',
            with: {
              'token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
              'title': 'feat: update kics version',
              'commit-message': 'feat: update kics version',
              'branch': 'automation/update-kics',
              'committer': 'GitHub Automation <noreply@github.com>',
              'labels': 'auto-approve',
            },
          },
          // Auto-approve PR
          {
            if: 'steps.create-pr.outputs.pull-request-number != 0',
            uses: 'peter-evans/enable-pull-request-automerge@v2',
            with: {
              'token': '${{ secrets.PROJEN_GITHUB_TOKEN }}',
              'pull-request-number': '${{ steps.create-pr.outputs.pull-request-number }}',
              'merge-method': 'squash',
            },
          },
        ],
      },
    });
  }
}

export class SecChecks extends Component {
  constructor(project: JsiiProject) {
    super(project);

    const secChecksAction = {
      name: 'Trivy Scan',
      runsOn: ['ubuntu-20.04'],
      permissions: {},
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

    const secChecksWorkflow = project.github?.tryFindWorkflow('sec-checks');
    if (secChecksWorkflow != null) {
      secChecksWorkflow.addJob('trivy-file-system', { ...secChecksAction });
    } else {
      const workflow = project.github?.addWorkflow('sec-checks');
      workflow?.addJob('trivy-file-system', { ...secChecksAction });
      workflow?.on({
        push: { branches: ['main'] },
        pullRequest: {},
      });
    }
  }
}
