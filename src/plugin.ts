import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  IPolicyValidationPluginBeta1,
  IPolicyValidationContextBeta1,
  PolicyViolationBeta1,
  PolicyValidationPluginReportBeta1,
} from 'aws-cdk-lib';
import { KicsSchema, Severity, QueryCategory } from './private/schema';
import { exec } from './utils';

export { Severity, QueryCategory } from './private/schema';

/**
 * Configuration options for the Kics plugin
 */
export interface KicsValidatorProps {
  /**
   * List of query categories which should be excluded
   * from the results.
   *
   * @default - no categories are excluded
   */
  readonly excludeCategories?: QueryCategory[];

  /**
   * List of query ids which should be excluded
   *
   * The full list can be found
   * @see https://docs.kics.io/latest/queries/all-queries/
   *
   * @default - no queries are excluded
   */
  readonly excludeQueries?: string[];

  /**
   * List of severities which should not be shown
   * in the results
   *
   * @default - all severities are shown
   */
  readonly excludeSeverities?: Severity[];
  /**
   * List of severities which should cause the
   * execution to fail
   *
   * @default [Severity.CRITICAL ,Severity.HIGH, Severity.MEDIUM]
   */
  readonly failureSeverities?: Severity[];
}

/**
 * A validation plugin using CFN Guard
 */
export class KicsValidator implements IPolicyValidationPluginBeta1 {
  public readonly name: string;
  private readonly kics: string;
  private readonly excludeQueries?: string[];
  private readonly excludeCategories?: string[];
  private readonly excludeSeverities?: string[];
  private readonly failureSeverities: string[];
  public readonly queryResults?: string[];
  public recentValidations?: PolicyViolationBeta1[];


  constructor(props: KicsValidatorProps = {}) {
    this.name = 'kics-cdk-validator-plugin';
    const platform = os.platform() === 'win32' ? 'windows' : os.platform();
    const arch = getArch();

    this.excludeQueries = props.excludeQueries;
    this.excludeCategories = props.excludeCategories;
    this.excludeSeverities = props.excludeSeverities;
    this.failureSeverities = props.failureSeverities ?? [Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM];


    this.kics = path.join(__dirname, '..', 'bin', `${platform}_${arch}`, platform.toString() === 'windows' ? 'kics.exe' : 'kics');
  }

  validate(context: IPolicyValidationContextBeta1): PolicyValidationPluginReportBeta1 {
    const reportDir = fs.realpathSync(os.tmpdir());
    const reportPath = path.join(reportDir, this.name);
    const flags = [
      this.kics,
      'scan',
      ...context.templatePaths.flatMap(template => ['--path', template]),
      '--output-path', `${reportDir}`,
      '--output-name', `${this.name}`,
      '--libraries-path', path.join(__dirname, '..', 'assets', 'libraries'),
      '--queries-path', path.join(__dirname, '..', 'assets', 'queries'),
      ...this.failureSeverities.flatMap(severity => ['--fail-on', severity]),
      ...this.excludeQueries ? this.excludeQueries.flatMap(query => ['--exclude-queries', query]) : [],
      ...this.excludeCategories ? this.excludeCategories.flatMap(category => ['--exclude-categories', category]) : [],
      ...this.excludeSeverities ? this.excludeSeverities.flatMap(severity => ['--exclude-severities', severity]) : [],
      '--ci',
      '--report-formats', '"json"',
    ];
    let success: boolean = true;
    const violations: PolicyViolationBeta1[] = [];
    try {
      exec(flags);
      const results = fs.readFileSync(`${reportPath}.json`, { encoding: 'utf-8' });
      const output: KicsSchema = JSON.parse(results);

      output.queries.forEach((query) => {
        if (success ) {
          success = !this.failureSeverities.some((value) => value.toUpperCase() === query.severity.toUpperCase());
        }
        violations.push({
          fix: query.query_url,
          ruleName: query.query_name,
          description: query.description,
          severity: query.severity,
          ruleMetadata: {
            Category: query.category,
            QueryId: query.query_id,
          },
          violatingResources: query.files.map((file) => ({
            resourceLogicalId: file.resource_name,
            templatePath: path.join(path.dirname(file.file_name), path.basename(file.file_name)),
            locations: [file.search_key],
          })),
        });
      });

    } catch (e) {
      success = false;
      console.error(e);
    }
    this.recentValidations = violations;
    return {
      violations,
      success,
    };
  }
}

function getArch(): string {
  switch (os.arch()) {
    case 'x64':
      return 'amd64';
    case 'arm64':
      return 'arm64';
    default:
      throw new Error(`Architecture ${os.arch} is not supported`);
  }
}
