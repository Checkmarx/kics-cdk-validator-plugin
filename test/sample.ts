import { App, Stack } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
//import * as iam from 'aws-cdk-lib/aws-iam';
//import * as rds from 'aws-cdk-lib/aws-rds';
//import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { KicsValidator } from '../src/plugin';

const app = new App({
  policyValidationBeta1: [
    new KicsValidator(),
  ],
});

const stack = new Stack(app, 'Stack');

new s3.Bucket(stack, 'Bucket', {
  publicReadAccess: true
});


// Create a VPC
//const vpc = new ec2.Vpc(stack, 'MyVpc', {
//  maxAzs: 2, // Number of availability zones
//});
//
//// Create a publicly accessible RDS instance
//new rds.DatabaseInstance(stack, 'MyPublicRdsInstance', {
//  engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0 }),
//  instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
//  vpc,
//  publiclyAccessible: true, // Make the RDS instance publicly accessible
//  credentials: rds.Credentials.fromGeneratedSecret('admin'), // Optional: Generate a username and password
//  databaseName: 'mydb',
//  allocatedStorage: 20, // Optional: Storage size in GB
//});

app.synth();
