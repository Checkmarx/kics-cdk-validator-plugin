import { App, Stack } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { KicsValidator } from '../src/plugin';

const app = new App({
  policyValidationBeta1: [
    new KicsValidator(),
  ],
});

const stack = new Stack(app, 'Stack');
new s3.Bucket(stack, 'Bucket');

app.synth();
