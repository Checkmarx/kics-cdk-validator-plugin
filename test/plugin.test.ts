import os from 'os';
import * as path from 'path';
import mock from 'mock-fs';
import * as plugin from '../src/plugin';
import { KicsSchema } from '../src/private/schema';
import * as utils from '../src/utils';

let execMock: jest.SpyInstance;
let platformMock: jest.SpyInstance;
let archMock: jest.SpyInstance;
beforeEach(() => {
  mock({
    '/tmp/kics-cdk-validator-plugin.json': JSON.stringify(getKicsResult()),
  });
  execMock = jest.spyOn(utils, 'exec').mockReturnValue(getKicsResult());
  platformMock = jest.spyOn(os, 'platform').mockReturnValue('linux');
  archMock = jest.spyOn(os, 'arch').mockReturnValue('x64');
  jest.spyOn(os, 'tmpdir').mockReturnValue('/tmp');
});

afterEach(() => {
  mock.restore();
  jest.restoreAllMocks();
});

describe('KicsPlugin', () => {
  test('kics called', () => {
    // GIVEN
    const validator = new plugin.KicsValidator();

    // WHEN
    validator.validate({
      templatePaths: ['template-path-1', 'template-path-2'],
    });

    // THEN
    expect(execMock).toHaveBeenCalledTimes(1);
    expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
      path.join(__dirname, '../bin/linux_amd64/kics'),
      'scan',
      '--path', 'template-path-1',
      '--path', 'template-path-2',
      '--output-path', expect.any(String),
      '--output-name', expect.stringMatching(/.*kics-cdk-validator-plugin/),
      '--fail-on', 'high',
      '--fail-on', 'medium',
      '--ci',
      '--report-formats', '"json"',
    ]));
  });

  test('can provide configuration', () => {
    // GIVEN
    const validator = new plugin.KicsValidator({
      excludeCategories: [
        plugin.QueryCategory.BACKUP,
        plugin.QueryCategory.ENCRYPTION,
      ],
      excludeQueries: [
        '2730c169-51d7-4ae7-99b5-584379eff1bb',
      ],
      excludeSeverities: [
        plugin.Severity.LOW,
        plugin.Severity.TRACE,
      ],
      failureSeverities: [
        plugin.Severity.HIGH,
        plugin.Severity.INFO,
      ],
    });

    // WHEN
    validator.validate({
      templatePaths: ['template-path-1', 'template-path-2'],
    });

    // THEN
    expect(execMock).toHaveBeenCalledTimes(1);
    expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
      path.join(__dirname, '../bin/linux_amd64/kics'),
      'scan',
      '--path', 'template-path-1',
      '--path', 'template-path-2',
      '--output-path', expect.any(String),
      '--output-name', expect.stringMatching(/.*kics-cdk-validator-plugin/),
      '--fail-on', 'high',
      '--fail-on', 'info',
      '--exclude-queries', '2730c169-51d7-4ae7-99b5-584379eff1bb',
      '--exclude-categories', 'Backup',
      '--exclude-categories', 'Encryption',
      '--exclude-severities', 'low',
      '--exclude-severities', 'trace',
      '--ci',
      '--report-formats', '"json"',
    ]));
  });

  test('kics returns validation results', () => {
    // GIVEN
    const validator = new plugin.KicsValidator();

    // WHEN
    const results = validator.validate({
      templatePaths: ['template-path-1', 'template-path-2'],
    });
    expect(results).toEqual({
      success: false,
      violations: [
        {
          description: 'Some description',
          fix: 'https://example.com',
          ruleMetadata: {
            Category: 'Encryption',
            QueryId: 'abcdefg',
          },
          ruleName: 'some query',
          severity: 'high',
          violatingResources: [
            {
              locations: [
                'Resources.BucketAAAAA.Properties',
              ],
              resourceLogicalId: 'BucketAAAAA',
              templatePath: 'sometemplate.json',
            },
          ],
        },
      ],
    });
  });

  describe('correct platform executable used', () => {
    const templatePaths = ['template.json'];
    test('linux arm', () => {
      // GIVEN
      archMock.mockReturnValue('arm64');
      const kics = new plugin.KicsValidator();

      // WHEN
      kics.validate({
        templatePaths,
      });

      // THEN
      expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
        path.join(__dirname, '../bin/linux_arm64/kics'),
      ]));
    });

    test('darwin arm', () => {
      // GIVEN
      platformMock.mockReturnValue('darwin');
      archMock.mockReturnValue('arm64');
      const kics = new plugin.KicsValidator();

      // WHEN
      kics.validate({
        templatePaths,
      });

      // THEN
      expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
        path.join(__dirname, '../bin/darwin_arm64/kics'),
      ]));
    });

    test('darwin amd', () => {
      // GIVEN
      platformMock.mockReturnValue('darwin');
      const kics = new plugin.KicsValidator();

      // WHEN
      kics.validate({
        templatePaths,
      });

      // THEN
      expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
        path.join(__dirname, '../bin/darwin_amd64/kics'),
      ]));
    });

    test('windows amd', () => {
      // GIVEN
      platformMock.mockReturnValue('win32');
      const kics = new plugin.KicsValidator();

      // WHEN
      kics.validate({
        templatePaths,
      });

      // THEN
      expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
        path.join(__dirname, '../bin/windows_amd64/kics.exe'),
      ]));
    });

    test('windows arm', () => {
      // GIVEN
      platformMock.mockReturnValue('win32');
      archMock.mockReturnValue('arm64');
      const kics = new plugin.KicsValidator();

      // WHEN
      kics.validate({
        templatePaths,
      });

      // THEN
      expect(execMock).toHaveBeenCalledWith(expect.arrayContaining([
        path.join(__dirname, '../bin/windows_arm64/kics.exe'),
      ]));
    });

  });
});

function getKicsResult(): KicsSchema {
  return {
    kics_version: 'v0.0.0',
    queries: [
      {
        category: plugin.QueryCategory.ENCRYPTION,
        query_id: 'abcdefg',
        description: 'Some description',
        files: [
          {
            actual_value: 'actual value',
            expected_value: 'expected value',
            file_name: 'sometemplate.json',
            issue_type: 'IncorrectValue',
            line: 9,
            resource_name: 'BucketAAAAA',
            resource_type: 'AWS::S3::Bucket',
            search_key: 'Resources.BucketAAAAA.Properties',
            search_line: 0,
            search_value: '',
          },
        ],
        query_name: 'some query',
        query_url: 'https://example.com',
        severity: plugin.Severity.HIGH,
      },
    ],
  };
}
