import {createHash} from 'crypto';
import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import {v4} from 'uuid';
import {ShortFormVideo, Video} from "../models/video";
import {getUserById} from "./user";
import {findCommentsByVideoId} from "./comment";

const XAWS = AWSXRay.captureAWS(AWS);
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const VIDEOS_TABLE = process.env.VIDEOS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
const COMMENTS_TABLE = process.env.COMMENTS_TABLE;
const VIDEOS_BUCKET = process.env.VIDEOS_BUCKET;
const VIDEO_SIGNED_URL_EXPIRATION = process.env.VIDEO_SIGNED_URL_EXPIRATION;
const THUMBNAILS_BUCKET = process.env.THUMBNAILS_BUCKET;
const THUMBNAIL_SIGNED_URL_EXPIRATION = process.env.THUMBNAIL_SIGNED_URL_EXPIRATION;
const VIDEOS_TABLE_INDEX = process.env.VIDEOS_TABLE_INDEX;

export const createVideo = async (userId: string, title: string, description: string) => {
  const createdAt = new Date().toISOString();
  const video: Video = {
    id: createHash('sha256').update(v4()).digest('hex'),
    userId,
    title,
    searchTitle: title.toLowerCase(),
    description,
    createdAt,
    updatedAt: createdAt,
    likes: [],
    dislikes: [],
    totalViews: 0,
  };

  await docClient.put({
    TableName: VIDEOS_TABLE,
    Item: video,
  }).promise();

  console.log(`INFO/DataLayer/video.ts/createVideo Video with id ${video.id} has been created by user with id ${userId}`);

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {id: userId},
    UpdateExpression: 'set videos = list_append(videos, :videoId)',
    ExpressionAttributeValues: {
      ':videoId': [video.id],
    },
  }).promise();

  console.log(`INFO/DataLayer/video.ts/createVideo Video with id ${video.id} has been added to list videos of user with id ${userId}`);

  return video;
};

export const findVideoById = async (videoId: string): Promise<Video> => {
  const result = await docClient.get({
    TableName: VIDEOS_TABLE,
    Key: {
      id: videoId,
    },
  }).promise();

  console.log(`INFO/DataLayer/video.ts/findVideoById Video with id ${videoId} has been retrieved`);

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
    FilterExpression: 'contains(searchTitle, :searchTitle)',
    ExpressionAttributeValues: {
      ':searchTitle': title.toLowerCase(),
    },
    ProjectionExpression: 'id, userId, title, totalViews, likes, dislikes',
  }).promise();

  console.log(`INFO/DataLayer/video.ts/getVideos Videos contain title ${title} have been retrieved`);

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

  console.log(`INFO/DataLayer/video.ts/getVideos Videos contain title ${title} have been converted to short form`);

  return {
    videos,
    nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
  };
};

export const getVideosByUserId = async  (userId: string, title: string, limit: number, nextKey: any) => {
  const result = await docClient.query({
    TableName: VIDEOS_TABLE,
    IndexName: VIDEOS_TABLE_INDEX,
    KeyConditionExpression: 'userId = :userId',
    FilterExpression: 'contains(searchTitle, :searchTitle)',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':searchTitle': title.toLowerCase()
    },
    ProjectionExpression: 'id, userId, title, totalViews, likes, dislikes',
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: nextKey,
  }).promise();

  console.log(`INFO/DataLayer/video.ts/getVideosByUserId Videos of user ${userId} contain title ${title} have been retrieved`);

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

  console.log(`INFO/DataLayer/video.ts/getVideosByUserId Videos of user ${userId} contain title ${title} have been converted to short form`);

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

  console.log(`INFO/DataLayer/video.ts/deleteVideo Video with id ${videoId} has been removed`);

  const videoIndex = user.videos.indexOf(videoId);

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {id: video.userId},
    UpdateExpression: `REMOVE videos[${videoIndex}]`,
  }).promise();

  console.log(`INFO/DataLayer/video.ts/deleteVideo Video entry with id ${videoId} has been removed from list videos of user ${user.id}`);

  const comments = await findCommentsByVideoId(videoId);
  for (const comment of comments.comments) {
    try {
      await docClient.delete({
        TableName: COMMENTS_TABLE,
        Key: {
          id: comment.id,
        },
      }).promise();

      console.log(`INFO/DataLayer/video.ts/deleteVideo Comment with id ${comment.id} of video with id ${videoId} has been removed`);
    }
    catch (e) {
      console.log(`ERROR/DataLayer/video.ts/deleteVideo Comment with id ${comment.id} of video with id ${videoId} cannot be removed with error: ${e}`);
    }
  }

  try {
    await s3.deleteObject({
      Bucket: VIDEOS_BUCKET,
      Key: `${videoId}.mp4`,
    }).promise();

    console.log(`INFO/DataLayer/video.ts/deleteVideo Video MP4 file of video with id ${videoId} has been removed from S3`);
  }
  catch (e) {
    console.log(`ERROR/DataLayer/video.ts/deleteVideo Video MP4 file of video with id ${videoId} cannot be removed with error: ${e}`);
  }

  try {
    await s3.deleteObject({
      Bucket: THUMBNAILS_BUCKET,
      Key: `${videoId}.png`,
    }).promise();

    console.log(`INFO/DataLayer/video.ts/deleteVideo Thumbnail PNG file of video with id ${videoId} has been removed from S3`);
  }
  catch (e) {
    console.log(`ERROR/DataLayer/video.ts/deleteVideo Thumbnail PNG file of video with id ${videoId} cannot be removed with error: ${e}`);
  }
};

export const updateVideo = async (videoId: string, updated: {
  title?: string;
  description?: string;
  content?: boolean;
}) => {
  let updateExpression = '';
  const expressionAttributeValues = {};
  if (updated.title.trim()) {
    updateExpression += 'title = :title, searchTitle = :searchTitle, ';
    expressionAttributeValues[':title'] = updated.title.trim();
    expressionAttributeValues[':searchTitle'] = updated.title.trim().toLowerCase();
  }
  if (updated.description) {
    updateExpression += 'description = :description, ';
    expressionAttributeValues[':description'] = updated.description;
  }
  if (updateExpression) {
    updateExpression += 'updatedAt = :updatedAt';
    updateExpression = 'set ' + updateExpression;
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    console.log(updateExpression);
    console.log(expressionAttributeValues);

    await docClient.update({
      TableName: VIDEOS_TABLE,
      Key: {id: videoId},
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    }).promise();

    console.log(`INFO/DataLayer/video.ts/updateVideo Video with id ${videoId} has been updated with UpdateExpression: ${updateExpression} and ExpressionAttributeValues: ${expressionAttributeValues}`);
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

    console.log(`INFO/DataLayer/video.ts/updateVideo Last updated time of video with id ${videoId} has been updated`);
  }
};

export const increaseVideoViews = async (videoId: string) => {
  await docClient.update({
    TableName: VIDEOS_TABLE,
    Key: {id: videoId},
    UpdateExpression: 'set totalViews = totalViews + :totalViews',
    ExpressionAttributeValues: {
      ':totalViews': 1,
    },
  }).promise();

  console.log(`INFO/DataLayer/video.ts/increaseVideoViews Total views of video with id ${videoId} has been increased`);
};

export const reactVideo = async (videoId: string, userId: string, likeOrDislike: 'likes' | 'dislikes') => {
  const video = await findVideoById(videoId);
  const oppositeReaction = likeOrDislike === 'likes' ? 'dislikes' : 'likes';

  if (video[likeOrDislike].includes(userId)) {
    return;
  }

  const index = video[oppositeReaction].indexOf(userId);
  if (index > -1) {
    await docClient.update({
      TableName: VIDEOS_TABLE,
      Key: {id: videoId},
      UpdateExpression: 'REMOVE ' + oppositeReaction + '[' + index + ']',
    }).promise();

    console.log(`INFO/DataLayer/video.ts/reactVideo Reaction ${oppositeReaction} of video with id ${videoId} has removed user with id ${userId}`);
  }

  await docClient.update({
    TableName: VIDEOS_TABLE,
    Key: {id: videoId},
    UpdateExpression: 'set ' + likeOrDislike + ' = list_append(' + likeOrDislike + ', :userId)',
    ExpressionAttributeValues: {
      ':userId': [userId],
    },
  }).promise();

  console.log(`INFO/DataLayer/video.ts/reactVideo Reaction ${likeOrDislike} of video with id ${videoId} has added user with id ${userId}`);
};

export const unreactVideo = async (videoId: string, userId: string, likeOrDislike: 'likes' | 'dislikes') => {
  const video = await findVideoById(videoId);

  if (!video[likeOrDislike].includes(userId)) {
    return;
  }

  const index = video[likeOrDislike].indexOf(userId);
  await docClient.update({
    TableName: VIDEOS_TABLE,
    Key: {id: videoId},
    UpdateExpression: 'REMOVE ' + likeOrDislike + '[' + index + ']',
  }).promise();

  console.log(`INFO/DataLayer/video.ts/unreactVideo Reaction ${likeOrDislike} of video with id ${videoId} has removed user with id ${userId}`);
};

export const resizeThumbnailToS3 = async (image: Buffer, key: string) => {
  return await s3.putObject({
    Bucket: THUMBNAILS_BUCKET,
    Key: key,
    Body: image,
  }).promise();
};