import {
  changeUsername,
  createUser as _createUser,
  generatePresignedUrlForAvatar,
  getSubscribedChannels as _getSubscribedChannels,
  getUserById,
  getUsersByUsername,
  resizeAvatarToS3,
  subscribeToUser,
  unsubscribeFromUser,
} from "../dataLayer/user";
import {resizeImage} from "@libs/image";
import Errors, {ErrorFormat} from "../errors/Errors";
import {ShortFormUser, User} from "../models/user";

/**
 * @param {string} id The id of user to get
 * @returns {Promise<User>} User with passed id
 * @throws {Errors.UserNotFound, Errors.UnknownError}
 * */
export const getProfile = async (id: string): Promise<User> => {
  let user: User;
  try {
    user = await getUserById(id);
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/getProfile Error when get profile of user with id ${id}. Error: ${e.messages}`);
    throw Errors.UnknownError(e.message);
  }

  if (!user) {
    console.log(`INFO/BusinessLayer/user.ts/createUser User with id ${id} cannot be found`);
    throw Errors.UserNotFound;
  }
  return user;
};

/**
 * 
 * @param {string} id The id of user to create
 * @returns {Promise<User>} created user
 * @throws {Errors.UserNotFound, Errors.UnknownError}
 */
export const createUser = async (id: string): Promise<User> => {
  try {
    await getProfile(id);
  }
  catch (e) {
    const error = e as ErrorFormat;
    if (error.statusCode === 404) {
      try {
        return await _createUser(id);
      }
      catch (e) {
        console.log(`ERROR/BusinessLayer/user.ts/createUser Error when create user with id ${id}. Error: ${e.message}`);
        throw Errors.UnknownError(e.message);
      }
    }
    throw Errors.UnknownError(e.message);
  }

  console.log(`INFO/BusinessLayer/user.ts/createUser User with id ${id} has been already existed`);
  throw Errors.UserAlreadyExists;
};

/**
 * @param {string} query.username? Username that is contained in users username
 * @param {string} query.limit? Limit number of users for each batch
 * @param {string} query.nextKey? Key for next batch of users
 * @returns {Promise<{ users: ShortFormUser[], nextKey: string | null }} users and nextKey for next batch users
 * @throws {Errors.LimitMustBeNumber, Errors.LimitMustBeGreaterThan0, Errors.InvalidNextKey, Errors.UnknownError}
 * */
export const searchUsers = async (query: { username?: string, limit?: string, nextKey?: string }):
  Promise<{ users: ShortFormUser[], nextKey: string | null }> => {
  const username = query.username || '';
  let limit = query.limit || 10;
  if (typeof limit === 'string') {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      console.log(`INFO/BusinessLayer/user.ts/searchUsers The limit parameter must be number. Current value: ${query.limit}`);
      throw Errors.LimitMustBeNumber;
    }

    if (limit <= 0) {
      console.log(`INFO/BusinessLayer/user.ts/searchUsers The limit parameter must be smaller than 0. Current value: ${query.limit}`);
      throw Errors.LimitMustBeGreaterThan0;
    }
  }

  let nextKey = query.nextKey;
  if (nextKey) {
    const uriDecoded = decodeURIComponent(nextKey);
    console.log('uriDecoded', uriDecoded);
    try {
      nextKey = JSON.parse(uriDecoded);
    }
    catch (e) {
      console.log(`ERROR/BusinessLayer/user.ts/searchUsers Invalid next key. Current value: ${nextKey}. Error: ${e.message}`);
      throw Errors.InvalidNextKey;
    }

    if (!(nextKey as any).id) {
      console.log(`ERROR/BusinessLayer/user.ts/searchUsers Invalid next key. Current value: ${nextKey}.`);
      throw Errors.InvalidNextKey;
    }
  }

  try {
    const result = await getUsersByUsername(username, limit, nextKey);
    console.log(`INFO/BusinessLayer/user.ts/searchUsers Users have username that contains ${query.username} have been retrieved`);
    return result;
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/searchUsers Unknown error when retrieve user that contains ${query.username}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} userId id of user that is subscribing
 * @param {string} channelId id of user that is going to be subscribed
 * @throws {Errors.CannotSubscribeSameId, Errors.UserNotFound, Errors.UnknownError}
 * */
export const subscribeToChannel = async (userId: string, channelId: string) => {
  if (userId === channelId) {
    throw Errors.CannotSubscribeSameId;
  }

  const user = await getProfile(userId);
  const targetUser = await getProfile(channelId);

  if (user.subscribedChannels.includes(targetUser.id)) {
    console.log(`INFO/BusinessLayer/user.ts/subscribeToChannel User with id ${userId} has already subscribed to target user with id ${channelId}`);
    return;
  }

  try {
    await subscribeToUser(userId, channelId);
    console.log(`INFO/BusinessLayer/user.ts/subscribeToChannel User with id ${userId} has subscribed to user with id ${channelId} successfully`);
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/subscribeToChannel Unknown error when user with id ${userId} is subscribing user with id ${channelId}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} userId id of user that is unsubscribing
 * @param {string} channelId id of user that is going to be unsubscribed
 * @throws {Errors.CannotUnsubscribeSameId, Errors.UserNotFound, Errors.UnknownError}
 * */
export const unsubscribeFromChannel = async (userId: string, channelId: string) => {
  if (userId === channelId) {
    throw Errors.CannotUnsubscribeSameId;
  }

  const user = await getProfile(userId);
  const targetUser = await getProfile(channelId);

  if (!user.subscribedChannels.includes(targetUser.id)) {
    console.log(`INFO/BusinessLayer/user.ts/unsubscribeFromChannel User with id ${userId} has already unsubscribed to target user with id ${channelId}`);
    return;
  }

  try {
    await unsubscribeFromUser(userId, channelId);
    console.log(`INFO/BusinessLayer/user.ts/unsubscribeToChannel User with id ${userId} has unsubscribed to user with id ${channelId} successfully`);
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/unsubscribeToChannel Unknown error when user with id ${userId} is unsubscribing user with id ${channelId}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} userId id of user that is changing username
 * @param {string} newUsername new username
 * @throws {Errors.UserNotFound, Errors.InvalidUsername, Errors.UnknownError}
 * */
export const editUsername = async (userId: string, newUsername: string) => {
  const user = await getProfile(userId);

  if (!newUsername.trim()) {
    console.log(`INFO/BusinessLayer/user.ts/editUsername Invalid username. Current value: '${newUsername}'`);
    throw Errors.InvalidUsername;
  }

  if (user.username === newUsername) {
    console.log(`INFO/BusinessLayer/user.ts/editUsername User with id ${userId} is changing new username with the same old username.`);
    return;
  }

  try {
    await changeUsername(userId, newUsername.trim());
    console.log(`INFO/BusinessLayer/user.ts/editUsername User with id ${userId} has renamed successfully`);
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/editUsername Unknown error when changing username of user with id ${userId}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} userId id of user that is changing avatar
 * @returns {Promise<string>} presigned url to change avatar
 * @throws {Errors.UserNotFound, Errors.UnknownError}
 * */
export const changeAvatar = async (userId: string): Promise<string> => {
  await getProfile(userId);

  try {
    const url = await generatePresignedUrlForAvatar(userId);
    console.log(`INFO/BusinessLayer/user.ts/changeAvatar Presigned URL to change avatar for user with id ${userId} has been generated`);
    return url;
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/changeAvatar Unknown error when generating presigned URL to change avatar for user with id: ${userId}. Error: ${e.message}`)
    throw Errors.UnknownError(e.message);
  }
}

/**
 * @param {string} userId id of user that is fetching list subscribed users
 * @returns {ShortFormUser[]} list subscribed users
 * @throws {Errors.UserNotFound, Errors.UnknownError}
 * */
export const getSubscribedChannels = async (userId: string) => {
  await getProfile(userId);

  try {
    const users = await _getSubscribedChannels(userId);
    console.log(`INFO/BusinessLayer/user.ts/getSubscribedChannels list subscribed users of user with id ${userId} has been fetched`);
    return users;
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/user.ts/getSubscribedChannels Unknown error when fetching list subscribed users for user with id ${userId}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} key avatar's key in S3 bucket
 * @throws {Errors.InvalidImage, Errors.UnknownError}
 * */
export const resizeAvatar = async (key: string) => {
  const buffer = await resizeImage(`https://udatube-avatars-dev.s3.amazonaws.com/${key}`, 500, 500);
  if (!buffer) {
    throw Errors.InvalidImage;
  }
  try {
    await resizeAvatarToS3(buffer, key);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};