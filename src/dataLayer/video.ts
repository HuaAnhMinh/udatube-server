import { createHash } from 'crypto';
import * as AWS from 'aws-sdk';
import { v4 } from 'uuid';
import {Video} from "../models/video";

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const VIDEOS_TABLE = process.env.VIDEOS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
const VIDEOS_BUCKET = process.env.VIDEOS_BUCKET;
const VIDEO_SIGNED_URL_EXPIRATION = process.env.VIDEO_SIGNED_URL_EXPIRATION;
const THUMBNAILS_BUCKET = process.env.THUMBNAILS_BUCKET;
const THUMBNAIL_SIGNED_URL_EXPIRATION = process.env.THUMBNAIL_SIGNED_URL_EXPIRATION;

export const createVideo = async (userId: string, title: string, description: string) => {
  const video: Video = {
    id: createHash('sha256').update(v4()).digest('hex'),
    userId,
    title,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: [],
    dislikes: [],
    totalViews: 0,
  };

  await docClient.put({
    TableName: VIDEOS_TABLE,
    Item: video,
  }).promise();

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {id: userId},
    UpdateExpression: 'set videos = list_append(videos, :videoId)',
    ExpressionAttributeValues: {
      ':videoId': [video.id],
    },
  }).promise();

  return video;
};

export const findVideoById = async (videoId: string): Promise<Video> => {
  const result = await docClient.get({
    TableName: VIDEOS_TABLE,
    Key: {
      id: videoId,
    },
  }).promise();

  return result.Item as Video;
};

export const generatePresignedUrlUploadVideo = async (videoId: string) => {
  return await s3.getSignedUrlPromise('putObject', {
    Bucket: VIDEOS_BUCKET,
    Key: `${videoId}.mp4`,
    Expires: parseInt(VIDEO_SIGNED_URL_EXPIRATION),
    ContentType: 'video/mp4',
  });
};

export const generatePresignedUrlUploadThumbnail = async (videoId: string) => {
  return await s3.getSignedUrlPromise('putObject', {
    Bucket: THUMBNAILS_BUCKET,
    Key: `${videoId}.png`,
    Expires: parseInt(THUMBNAIL_SIGNED_URL_EXPIRATION),
    ContentType: 'image/png',
  });
};