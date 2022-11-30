import {createHash} from 'crypto';
import * as AWS from "aws-sdk";
import {v4} from "uuid";
import {Comment} from "../models/comment";

const docClient = new AWS.DynamoDB.DocumentClient();

const COMMENTS_TABLE = process.env.COMMENTS_TABLE;
const COMMENTS_TABLE_INDEX = process.env.COMMENTS_TABLE_INDEX;

export const createComment = async (userId: string, videoId: string, content: string) => {
  const createdAt = new Date().toISOString();
  const newComment: Comment = {
    id: createHash('sha256').update(v4()).digest('hex'),
    userId,
    videoId,
    content,
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
  const result = await docClient.query({
    TableName: COMMENTS_TABLE,
    IndexName: COMMENTS_TABLE_INDEX,
    KeyConditionExpression: 'videoId = :videoId',
    Limit: limit,
    ExclusiveStartKey: nextKey,
    ExpressionAttributeValues: {
      ':videoId': videoId,
    },
    ScanIndexForward: false,
  }).promise();

  return {
    comments: result.Items as Comment[],
    nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
  };
};

export const findCommentById = async (id: string): Promise<Comment | null> => {
  return (await docClient.get({
    TableName: COMMENTS_TABLE,
    Key: {
      id,
    }
  }).promise()).Item as Comment;
};

export const deleteComment = async (id: string) => {
  await docClient.delete({
    TableName: COMMENTS_TABLE,
    Key: {
      id,
    },
  }).promise();
};

export const updateComment = async (id: string, content: string) => {
  await docClient.update({
    TableName: COMMENTS_TABLE,
    Key: {
      id,
    },
    UpdateExpression: 'set content = :content, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':content': content,
      ':updatedAt': new Date().toISOString(),
    },
  }).promise();
};