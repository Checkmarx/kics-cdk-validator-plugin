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

export class SecurityChecks extends Component {
  constructor(project: JsiiProject) {
    super(project);

    const trivyScan = {
      name: 'Trivy Scan',
      runsOn: ['ubuntu-latest'],
      permissions: {},
      steps: this.createScanSteps('Trivy', 'aquasecurity/trivy-action@master', {
        'scan-type': 'fs',
        'ignore-unfixed': true,
        'format': 'json',
        'output': './results.json',
        'severity': 'CRITICAL,HIGH,MEDIUM',
        'exit-code': '1',
      }),
    };

    const grypeScan = {
      name: 'Grype Scan',
      runsOn: ['ubuntu-latest'],
      permissions: {},
      steps: this.createScanSteps('Grype', 'anchore/scan-action@v3', {
        'path': '.',
        'only-fixed': false,
        'output-format': 'json',
        'severity-cutoff': 'medium',
        'fail-build': true,
      }),
    };

    this.addSecurityChecksWorkflow(project, trivyScan, grypeScan);
  }

  private createScanSteps(scannerName: string, scannerAction: string, options: any) {
    return [
      {
        name: 'Checkout code',
        uses: 'actions/checkout@v4',
      },
      {
        name: `Run ${scannerName} vulnerability scanner in repo mode`,
        uses: scannerAction,
        with: options,
      },
      {
        name: 'Inspect action report',
        if: 'always()',
        run: 'cat ./results.json',
      },
      {
        name: 'Upload artifact',
        if: 'always()',
        uses: 'actions/upload-artifact@v4',
        with: {
          name: `${scannerName.toLowerCase()}-scan-report`,
          path: './results.json',
        },
      },
    ];
  }

  private addSecurityChecksWorkflow(project: JsiiProject, trivyScan: any, grypeScan: any) {
    const securityChecksWorkflow = project.github?.tryFindWorkflow('security-checks');
    const jobsToAdd = {
      'trivy-file-system': trivyScan,
      'grype-file-system': grypeScan,
    };

    if (securityChecksWorkflow != null) {
      securityChecksWorkflow.addJobs(jobsToAdd);
    } else {
      const workflow = project.github?.addWorkflow('security-checks');
      workflow?.addJobs(jobsToAdd);
      workflow?.on({
        push: { branches: ['main'] },
        pullRequest: {},
      });
    }
  }
}
