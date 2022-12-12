import {createHash} from 'crypto';
import * as AWS from "aws-sdk";
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import {v4} from "uuid";
import {Comment} from "../models/comment";

const XAWS = AWSXRay.captureAWS(AWS);
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();

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

  console.log(`INFO/DataLayer/comment.ts/createComment New comment with id ${newComment.id} for video with id ${videoId} has been created`);

  return newComment;
};

export const findCommentsByVideoId = async (videoId: string, limit?: number, nextKey?: any): Promise<{ comments: Comment[], nextKey: string | null }> => {
  const query: DocumentClient.QueryInput = {
    TableName: COMMENTS_TABLE,
    IndexName: COMMENTS_TABLE_INDEX,
    KeyConditionExpression: 'videoId = :videoId',
    ExpressionAttributeValues: {
      ':videoId': videoId,
    },
    ScanIndexForward: false,
  };

  if (limit) {
    query.Limit = limit;
  }

  if (nextKey) {
    query.ExclusiveStartKey = nextKey;
  }

  const result = await docClient.query(query).promise();

  console.log(`INFO/DataLayer/comment.ts/findCommentsByVideoId Comments for video with id ${videoId} have been retrieved`);

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

  console.log(`INFO/DataLayer/comment.ts/findCommentById Comment with id ${id} has been retrieved`);
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

  console.log(`INFO/DataLayer/comment.ts/findCommentById Comment with id ${id} has been updated its content`);
};