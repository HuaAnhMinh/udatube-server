import {createHash} from 'crypto';
import * as AWS from "aws-sdk";
import {v4} from "uuid";
import {Comment} from "../models/comment";

const docClient = new AWS.DynamoDB.DocumentClient();

const COMMENTS_TABLE = process.env.COMMENTS_TABLE;

export const createComment = async (userId: string, videoId: string, comment: string) => {
  const createdAt = new Date().toISOString();
  const newComment: Comment = {
    id: createHash('sha256').update(v4()).digest('hex'),
    userId,
    videoId,
    comment,
    createdAt,
    updatedAt: createdAt,
  };

  await docClient.put({
    TableName: COMMENTS_TABLE,
    Item: newComment,
  }).promise();

  return newComment;
};

export const findCommentsByVideoId = async (videoId: string): Promise<Comment[]> => {
  const result = await docClient.scan({
    TableName: COMMENTS_TABLE,
    FilterExpression: 'videoId = :videoId',
    ExpressionAttributeValues: {
      ':videoId': videoId,
    },
  }).promise();

  return result.Items as Comment[];
};

export const findCommentsByVideoIdWithPagination = async (videoId: string, limit: number, nextKey: any): Promise<{ comments: Comment[], nextKey: string | null }> => {
  const result = await docClient.scan({
    TableName: COMMENTS_TABLE,
    Limit: limit,
    ExclusiveStartKey: nextKey,
    FilterExpression: 'videoId = :videoId',
    ExpressionAttributeValues: {
      ':videoId': videoId,
    },
  }).promise();

  return {
    comments: result.Items as Comment[],
    nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
  };
};