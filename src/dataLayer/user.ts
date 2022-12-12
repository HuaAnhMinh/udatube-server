import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import {ShortFormUser, User} from "../models/user";

const XAWS = AWSXRay.captureAWS(AWS);
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});
const USERS_TABLE = process.env.USERS_TABLE;
const AVATARS_BUCKET = process.env.AVATARS_BUCKET;
const AVATAR_SIGNED_URL_EXPIRATION = process.env.AVATAR_SIGNED_URL_EXPIRATION;

/**
 * 
 * @param {string} id The id of user to create 
 * @returns {User} The created user
 */
export const createUser = async (id: string): Promise<User> => {
  const defaultUsername = `user-${id.substring(0, 8)}`;
  const user: User = {
    id,
    username: defaultUsername,
    searchUsername: defaultUsername.toLowerCase(),
    subscribedChannels: [],
    videos: [],
    totalSubscribers: 0,
  };
  await docClient.put({
    TableName: USERS_TABLE,
    Item: user,
  }).promise();
  console.log(`INFO/DataLayer/user.ts/createUser User with username ${defaultUsername} has been created`);

  const defaultAvatar = 'data:image/png;base64,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';
  const base64DefaultAvatar = Buffer.from(defaultAvatar.replace(/^data:image\/\w+;base64,/, ""), 'base64');
  await s3.putObject({
    Bucket: AVATARS_BUCKET,
    Key: `${id}.png`,
    ContentEncoding: 'base64',
    ContentType: 'image/png',
    Body: base64DefaultAvatar,
  }).promise();
  console.log(`INFO/DataLayer/user.ts/createUser Avatar for user with username ${defaultUsername} has been created`);
  return user;
};

/**
 * @param {string} id The id of user to get
 *
 * @returns {Promise<User>} user with passed id
 */
export const getUserById = async (id: string): Promise<User> => {
  const result = await docClient.get({
    TableName: USERS_TABLE,
    Key: {
      id,
    },
    ConsistentRead: true,
  }).promise();
  console.log(`INFO/DataLayer/user.ts/getUserById User with id ${id} has been retrieved`);

  return result.Item as User;
};

/**
 * @param {string} username Username
 * @param {number} limit The limit number of users to get
 * @param {any} nextKey key of next batch of users to get
 * */
export const getUsersByUsername = async (username: string, limit: number, nextKey: any):
  Promise<{ users: ShortFormUser[], nextKey: string | null }> => {
  const result = await docClient.scan({
    TableName: USERS_TABLE,
    FilterExpression: 'contains(searchUsername, :searchUsername)',
    ExpressionAttributeValues: {
      ':searchUsername': username.toLowerCase(),
    },
    ProjectionExpression: 'id, username, totalSubscribers',
    ExclusiveStartKey: nextKey,
    Limit: limit,
  }).promise();
  console.log(`INFO/DataLayer/user.ts/getUsersByUsername Users with username contains ${username} have been retrieved`);

  return {
    users: result.Items as ShortFormUser[],
    nextKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
  };
};

export const subscribeToUser = async (userId: string, targetUserId: string) => {
  await docClient.update({
    TableName: USERS_TABLE,
    Key: {
      id: userId,
    },
    UpdateExpression: 'SET subscribedChannels = list_append(subscribedChannels, :targetUserId)',
    ExpressionAttributeValues: {
      ':targetUserId': [targetUserId],
    },
  }).promise();
  
  console.log(`INFO/DataLayer/user.ts/subscribeToUser target user with id ${targetUserId} has been added to subscribed list`);

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {
      id: targetUserId,
    },
    UpdateExpression: 'SET totalSubscribers = totalSubscribers + :increment',
    ExpressionAttributeValues: {
      ':increment': 1,
    },
  }).promise();

  console.log(`INFO/DataLayer/user.ts/subscribeToUser total subscribers of target user with id ${targetUserId} has been increased`);
};

export const unsubscribeFromUser = async (userId: string, targetUserId: string) => {
  const user = await getUserById(userId);
  const subscribedChannels = user.subscribedChannels.filter((id) => id !== targetUserId);

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {
      id: userId,
    },
    UpdateExpression: 'SET subscribedChannels = :subscribedChannels',
    ExpressionAttributeValues: {
      ':subscribedChannels': subscribedChannels,
    },
  }).promise();

  console.log(`INFO/DataLayer/user.ts/unsubscribeFromUser target user with id ${targetUserId} has been removed to subscribed list`);

  await docClient.update({
    TableName: USERS_TABLE,
    Key: {
      id: targetUserId,
    },
    UpdateExpression: 'SET totalSubscribers = totalSubscribers - :decrement',
    ExpressionAttributeValues: {
      ':decrement': 1,
    },
  }).promise();

  console.log(`INFO/DataLayer/user.ts/unsubscribeFromUser total subscribers of target user with id ${targetUserId} has been decreased`);
}

export const changeUsername = async (userId: string, newUsername: string) => {
  await docClient.update({
    TableName: USERS_TABLE,
    Key: {
      id: userId,
    },
    UpdateExpression: 'SET username = :newUsername, searchUsername = :newSearchUsername',
    ExpressionAttributeValues: {
      ':newUsername': newUsername,
      ':newSearchUsername': newUsername.toLowerCase(),
    },
  }).promise();
  console.log(`INFO/DataLayer/user.ts/changeUsername User with id ${userId} has renamed username to ${newUsername}`);
};

export const generatePresignedUrlForAvatar = async (userId: string) => {
  return await s3.getSignedUrlPromise('putObject', {
    Bucket: AVATARS_BUCKET,
    Key: `${userId}.png`,
    Expires: parseInt(AVATAR_SIGNED_URL_EXPIRATION),
    ContentType: 'image/png',
  });
};

export const getSubscribedChannels = async (userId: string) => {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  if (user.subscribedChannels.length === 0) {
    return [];
  }

  const result = await docClient.batchGet({
    RequestItems: {
      [USERS_TABLE]: {
        Keys: user.subscribedChannels.map((id) => ({id})),
        ProjectionExpression: 'id, username, totalSubscribers',
      },
    },
  }).promise();

  console.log(`INFO/DataLayer/user.ts/getSubscribedChannels subscribed channels of user with id ${userId} have been retrieved!`);

  return result.Responses[USERS_TABLE] as ShortFormUser[];
};

export const resizeAvatarToS3 = async (image: Buffer, key: string) => {
  return await s3.putObject({
    Bucket: AVATARS_BUCKET,
    Key: key,
    Body: image,
  }).promise();
};