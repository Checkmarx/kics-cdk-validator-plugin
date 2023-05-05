
export enum Severity {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info',
  TRACE = 'trace',
}

export enum QueryCategory {
  ACCESS_CONTROL = 'Access Control',
  AVAILABILITY = 'Availability',
  BACKUP = 'Backup',
  BEST_PRACTICES = 'Best Practices',
  BUILD_PROCESS = 'Build Process',
  ENCRYPTION = 'Encryption',
  INSECURE_CONFIGURATIONS = 'Insecure Configurations',
  INSECURE_DEFAULTS = 'Insecure Defaults',
  NETWORKING_AND_FIREWALL = 'Networking and Firewall',
  OBSERVABILITY = 'Observability',
  RESOURCE_MANAGEMENT = 'Resource Management',
  SECRET_MANAGEMENT = 'Secret Management',
  STRUCTURE_AND_SEMANTICS = 'Structure and Semantics',
  SUPPLY_CHAIN = 'Supply-Chain',
}

export interface KicsSchema {
  /**
   * The version of the kics CLI that was used
   */
  readonly kics_version: string;

  /**
   * List of Query results
   */
  readonly queries: QueryResult[];
}
export interface QueryResult {
  /**
   * The name of the query
   */
  readonly query_name: string;

  /**
   * The unique identifier for the query
   */
  readonly query_id: string;

  /**
   * The URL to the query documentation.
   *
   * This documentation should include
   * the information on how to fix
   */
  readonly query_url: string;

  /**
   * The severity of the query
   */
  readonly severity: Severity;

  /**
   * The query category
   */
  readonly category: QueryCategory;

  /**
   * The description of the query.
   * This sometimes contains the same information
   * as the 'query_name'
   */
  readonly description: string;

  /**
   * Information on the files that were scanned
   * and have results
   */
  readonly files: Files[];
}

export interface Files {
  /**
   * The relative path to the file that was scanned.
   * This path is relative to the container working
   * directory so the only useful information is the
   * filename part of the path
   */
  readonly file_name: string;

  /**
   * The line number where the result was found
   */
  readonly line: number;

  /**
   * The name of the resource with the result.
   * This will be the resource logical Id
   */
  readonly resource_name: string;

  /**
   * The resource type, i.e. 'AWS::S3::Bucket'
   */
  readonly resource_type: string;

  /**
   * The technical reason why the query failed.
   * e.g. 'MissingAttribute', 'IncorrectValue'
   */
  readonly issue_type: string;

  /**
   * The property path of the queried property.
   * e.g. 'Resources.Bucket83908E77.Properties.PublicAccessBlockConfiguration.RestrictPublicBuckets'
   */
  readonly search_key: string;

  /**
   * TODO: maybe remove? Not sure what this is
   */
  readonly search_line: number;

  /**
   * TODO: maybe remove? Not sure what this is
   */
  readonly search_value: string;

  /**
   * Information on what value was expected
   * e.g. "'IgnorePublicAcls' should be set to true%!(EXTRA string=Bucket83908E77)"
   * or "'Resources.Bucket222222D3FDCAC3.Properties.BucketName' or 'Resources.[Bucket222222D3FDCAC3]' should be associated with an 'AWS::S3::BucketPolicy'"
   */
  readonly expected_value: string;

  /**
   * Information  on what was actually found
   * e.g. "'Resources.Bucket222222D3FDCAC3.Properties.BucketName' or 'Resources.[Bucket222222D3FDCAC3]' is not associated with an 'AWS::S3::BucketPolicy'"
   */
  readonly actual_value: string;
}
