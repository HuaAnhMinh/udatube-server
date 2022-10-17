import { createHash } from 'crypto';
import * as AWS from 'aws-sdk';
import { v4 } from 'uuid';
import {Video} from "../models/video";

const docClient = new AWS.DynamoDB.DocumentClient();
// const s3 = new AWS.S3({
//   signatureVersion: 'v4'
// });

const VIDEOS_TABLE = process.env.VIDEOS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;
// const VIDEOS_BUCKET = process.env.VIDEOS_BUCKET;
// const THUMBNAILS_BUCKET = process.env.THUMBNAILS_BUCKET;

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