import type {AWS} from '@serverless/typescript';

import hello from '@functions/hello';
import Authorizer from "@functions/Authorizer";
import Register from "@functions/Register";
import ViewProfile from "@functions/ViewProfile";
import ViewProfileRole from "./src/roles/ViewProfileRole";
import RegisterRole from "./src/roles/RegisterRole";
import SearchUser from "@functions/SearchUser";
import SearchUserRole from "./src/roles/SearchUserRole";
import SubscribeChannel from "@functions/SubscribeChannel";
import SubscribeChannelRole from "./src/roles/SubscribeChannelRole";
import UnsubscribeChannel from "@functions/UnsubscribeChannel";
import UnsubscribeChannelRole from "./src/roles/UnsubscribeChannelRole";
import ChangeUsername from '@functions/ChangeUsername';
import ChangeUsernameRole from "./src/roles/ChangeUsernameRole";
import ChangeAvatarRole from "./src/roles/ChangeAvatarRole";
import ChangeAvatar from "@functions/ChangeAvatar";
import CreateVideo from "@functions/CreateVideo";
import CreateVideoRole from "./src/roles/CreateVideoRole";
import UploadVideo from "@functions/UploadVideo";
import UploadVideoRole from "./src/roles/UploadVideoRole";
import UploadThumbnail from "@functions/UploadThumbnail";
import UploadThumbnailRole from "./src/roles/UploadThumbnailRole";
import GetVideos from "@functions/GetVideos";
import GetVideosRole from "./src/roles/GetVideosRole";
import GetVideo from "@functions/GetVideo";
import GetVideoRole from "./src/roles/GetVideoRole";
import DeleteVideo from "@functions/DeleteVideo";
import DeleteVideoRole from "./src/roles/DeleteVideoRole";
import SyncVideoUpdatedTime from "@functions/SyncVideoUpdatedTime";
import SyncVideoUpdatedTimeRole from "./src/roles/SyncVideoUpdatedTimeRole";
import UpdateVideo from "@functions/UpdateVideo";
import UpdateVideoRole from "./src/roles/UpdateVideoRole";
import LikeVideo from "@functions/LikeVideo";
import ReactVideoRole from "./src/roles/ReactVideoRole";
import UnlikeVideo from "@functions/UnlikeVideo";
import DislikeVideo from "@functions/DislikeVideo";
import UndislikeVideo from "@functions/UndislikeVideo";
import CreateComment from "@functions/CreateComment";
import CreateCommentRole from "./src/roles/CreateCommentRole";
import GetComments from "@functions/GetComments";
import GetCommentsRole from "./src/roles/GetCommentsRole";
import DeleteCommentRole from "./src/roles/DeleteCommentRole";
import DeleteComment from "@functions/DeleteComment";
import UpdateComment from "@functions/UpdateComment";
import UpdateCommentRole from "./src/roles/UpdateCommentRole";

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
      COMMENTS_TABLE: 'UdaTubeComments-${self:provider.stage}',
      AVATARS_BUCKET: 'udatube-avatars-${self:provider.stage}',
      VIDEOS_BUCKET: 'udatube-videos-${self:provider.stage}',
      THUMBNAILS_BUCKET: 'udatube-thumbnails-${self:provider.stage}',
      VIDEOS_TOPIC: 'UdaTubeVideosTopic-${self:provider.stage}',
      JWKS_URI: 'https://huaanhminh.us.auth0.com/.well-known/jwks.json',
      AVATAR_SIGNED_URL_EXPIRATION: '300',
      VIDEO_SIGNED_URL_EXPIRATION: '3600',
      THUMBNAIL_SIGNED_URL_EXPIRATION: '300',
    },
  },
  // import the function via paths
  functions: {
    hello,
    Authorizer,
    Register,
    ViewProfile,
    SearchUser,
    SubscribeChannel,
    UnsubscribeChannel,
    ChangeUsername,
    ChangeAvatar,
    CreateVideo,
    UploadVideo,
    UploadThumbnail,
    GetVideos,
    GetVideo,
    DeleteVideo,
    SyncVideoUpdatedTime,
    UpdateVideo,
    LikeVideo,
    UnlikeVideo,
    DislikeVideo,
    UndislikeVideo,
    CreateComment,
    GetComments,
    DeleteComment,
    UpdateComment,
  },
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
      RegisterRole,
      ViewProfileRole,
      SearchUserRole,
      SubscribeChannelRole,
      UnsubscribeChannelRole,
      ChangeUsernameRole,
      ChangeAvatarRole,
      CreateVideoRole,
      UploadVideoRole,
      UploadThumbnailRole,
      GetVideosRole,
      GetVideoRole,
      DeleteVideoRole,
      SyncVideoUpdatedTimeRole,
      UpdateVideoRole,
      ReactVideoRole,
      CreateCommentRole,
      GetCommentsRole,
      DeleteCommentRole,
      UpdateCommentRole,
      UsersDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.USERS_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S',
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH',
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
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH',
          }],
        },
      },
      CommentsDynamoDBTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: '${self:provider.environment.COMMENTS_TABLE}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [{
            AttributeName: 'id',
            AttributeType: 'S',
          }],
          KeySchema: [{
            AttributeName: 'id',
            KeyType: 'HASH',
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
      VideosS3Bucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.VIDEOS_BUCKET}',
          NotificationConfiguration: {
            TopicConfigurations: [{
              Event: 's3:ObjectCreated:*',
              Topic: {
                Ref: 'VideosTopic',
              }
            }],
          },
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
      VideosS3BucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          PolicyDocument: {
            Id: '${self:provider.environment.VIDEOS_BUCKET}-policy',
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:*',
              Resource: 'arn:aws:s3:::${self:provider.environment.VIDEOS_BUCKET}/*',
            }],
          },
          Bucket: '${self:provider.environment.VIDEOS_BUCKET}',
        },
      },
      ThumbnailsS3Bucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: '${self:provider.environment.THUMBNAILS_BUCKET}',
          NotificationConfiguration: {
            TopicConfigurations: [{
              Event: 's3:ObjectCreated:*',
              Topic: {
                Ref: 'VideosTopic',
              }
            }],
          },
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
      ThumbnailsS3BucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          PolicyDocument: {
            Id: '${self:provider.environment.THUMBNAILS_BUCKET}-policy',
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: '*',
              Action: 's3:*',
              Resource: 'arn:aws:s3:::${self:provider.environment.THUMBNAILS_BUCKET}/*',
            }],
          },
          Bucket: '${self:provider.environment.THUMBNAILS_BUCKET}',
        },
      },
      VideosTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          DisplayName: 'UdaTube videos bucket topic',
          TopicName: '${self:provider.environment.VIDEOS_TOPIC}',
        },
      },
      SNSTopicPolicy: {
        Type: 'AWS::SNS::TopicPolicy',
        Properties: {
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [{
              Effect: 'Allow',
              Principal: {
                AWS: '*',
              },
              Action: 'sns:Publish',
              Resource: {
                Ref: 'VideosTopic',
              },
              Condition: {
                ArnLike: {
                  'AWS:SourceArn': [
                    'arn:aws:s3:::${self:provider.environment.VIDEOS_BUCKET}',
                    'arn:aws:s3:::${self:provider.environment.THUMBNAILS_BUCKET}',
                  ],
                },
              },
            }],
          },
          Topics: [{
            Ref: 'VideosTopic',
          }],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
