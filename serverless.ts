import type {AWS} from '@serverless/typescript';

import hello from '@functions/hello';
import Authorizer from "@functions/Authorizer";
import Register from "@functions/Register";
import {defaultLogStatements} from "./src/roles/roles";

const serverlessConfiguration: AWS = {
  service: 'udatube',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    httpApi: {
      authorizers: {
        customAuthorizer: {
          type: 'request',
          functionName: 'Authorizer',
        },
      },
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    logs: {
      restApi: true,
    },
    stage: '${opt:stage, "dev"}',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      USERS_TABLE: 'UdaTubeUsers-${self:provider.stage}',
      VIDEOS_TABLE: 'UdaTubeVideos-${self:provider.stage}',
      AVATARS_BUCKET: 'udatube-avatars-${self:provider.stage}',
      VIDEOS_BUCKET: 'udatube-videos-${self:provider.stage}',
      THUMBNAILS_BUCKET: 'udatube-thumbnails-${self:provider.stage}',
      JWKS_URI: 'https://huaanhminh.us.auth0.com/.well-known/jwks.json',
    },
  },
  // import the function via paths
  functions: {hello, Authorizer, Register},
  package: {individually: true},
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: {'require.resolve': undefined},
      platform: 'node',
      concurrency: 10,
    },
  },
  resources: {
    Resources: {
      RegisterRole: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: 'RegisterRole',
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: {
                Service: 'lambda.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            }],
          },
          Policies: [{
            PolicyName: 'RegisterPolicy',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [...defaultLogStatements, {
                Effect: 'Allow',
                Action: [
                  'dynamodb:PutItem',
                  'dynamodb:Scan',
                ],
                Resource: [
                  'arn:aws:dynamodb:us-east-1:*:table/${self:provider.environment.USERS_TABLE}',
                ],
              }, {
                Effect: 'Allow',
                Action: [
                  's3:PutObject',
                ],
                Resource: [
                  'arn:aws:s3:::${self:provider.environment.AVATARS_BUCKET}/*',
                ],
              }],
            },
          }],
        },
      },
      UsersDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.USERS_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S',
          }, {
            AttributeName: 'username',
            AttributeType: 'S',
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH',
          }, {
            AttributeName: 'username',
            KeyType: 'RANGE',
          }],
        },
      },
      VideosDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.VIDEOS_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S',
          }, {
            AttributeName: 'userId',
            AttributeType: 'S',
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH',
          }, {
            AttributeName: 'userId',
            KeyType: 'RANGE',
          }],
        },
      },
      AvatarsS3Bucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.AVATARS_BUCKET}',
          CorsConfiguration: {
            CorsRules: [{
              AllowedHeaders: ['*'],
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
              AllowedOrigins: ['*'],
              MaxAge: 3000,
            }],
          },
        },
      },
      AvatarsS3BucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          PolicyDocument: {
            Id: '${self:provider.environment.AVATARS_BUCKET}-policy',
            Version: '2012-10-17',
            Statement: [{
              Sid: 'PublicReadForGetBucketObjects',
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::${self:provider.environment.AVATARS_BUCKET}/*',
            }],
          },
          Bucket: '${self:provider.environment.AVATARS_BUCKET}',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
