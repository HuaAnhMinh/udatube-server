import { createHash } from 'crypto';
import * as AWS from 'aws-sdk';
import { v4 } from 'uuid';
import {ShortFormVideo, Video} from "../models/video";
import {getUserById} from "./user";

const docClient = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const VIDEOS_TABLE = process.env.VIDEOS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
// const COMMENTS_TABLE = process.env.COMMENTS_TABLE;
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

export const getVideos = async (title: string, limit: number, nextKey: any) => {
  const result = await docClient.scan({
    TableName: VIDEOS_TABLE,
    Limit: limit,
    ExclusiveStartKey: nextKey,
    FilterExpression: 'contains(title, :title)',
    ExpressionAttributeValues: {
      ':title': title,
    },
    ProjectionExpression: 'id, userId, title, totalViews, likes, dislikes',
  }).promise();

  const videos = result.Items.map((video: Video) => {
    return {
      id: video.id,
      userId: video.userId,
      title: video.title,
      totalViews: video.totalViews,
      likes: video.likes.length,
      dislikes: video.dislikes.length,
    } as ShortFormVideo;
  });

  return {
    videos,
    nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
  };
};

export const deleteVideo = async (videoId: string) => {
  const video = await findVideoById(videoId);
  const user = await getUserById(video.userId);

  await docClient.delete({
    TableName: VIDEOS_TABLE,
    Key: {
      id: videoId,
    },
  }).promise();

  const videoIndex = user.videos.indexOf(videoId);

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {id: video.userId},
    UpdateExpression: `REMOVE videos[${videoIndex}]`,
  }).promise();

  try {
    await s3.deleteObject({
      Bucket: VIDEOS_BUCKET,
      Key: `${videoId}.mp4`,
    }).promise();
  }
  catch (e) {
    console.log(e);
  }

  try {
    await s3.deleteObject({
      Bucket: THUMBNAILS_BUCKET,
      Key: `${videoId}.png`,
    }).promise();
  }
  catch (e) {
    console.log(e);
  }
};

export const updateVideo = async (videoId: string, updated: {
  title?: string;
  description?: string;
  content?: boolean;
}) => {
  let updateExpression = '';
  const expressionAttributeValues = {};
  if (updated.title) {
    updateExpression += 'set title = :title, ';
    expressionAttributeValues[':title'] = updated.title;
  }
  if (updated.description) {
    updateExpression += 'set description = :description, ';
    expressionAttributeValues[':description'] = updated.description;
  }
  if (updateExpression) {
    updateExpression += 'set updatedAt = :updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    await docClient.update({
      TableName: VIDEOS_TABLE,
      Key: {id: videoId},
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    }).promise();
  }

  if (updated.content) {
    await docClient.update({
      TableName: VIDEOS_TABLE,
      Key: {id: videoId},
      UpdateExpression: 'set updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':updatedAt': new Date().toISOString(),
      },
    }).promise();
  }
};