import {
  changeUsername,
  createUser as addUserToDB,
  generatePresignedUrlForAvatar,
  getSubscribedChannels as _getSubscribedChannels,
  getUserById,
  getUsersByUsername,
  resizeAvatarToS3,
  subscribeToUser,
  unsubscribeFromUser,
} from "../dataLayer/user";
import RegisterErrors from "../errors/RegisterErrors";
import SubscribeChannelErrors from "../errors/SubscribeChannelErrors";
import UnsubscribeChannelErrors from "../errors/UnsubscribeChannelErrors";
import ChangeUsernameErrors from "../errors/ChangeUsernameErrors";
import SearchUsersErrors from "../errors/SearchUsersErrors";
import {resizeImage} from "@libs/image";

export const getProfile = async (id: string) => {
  return await getUserById(id);
};

export const createUser = async (id: string) => {
  const user = await getProfile(id);
  if (user) {
    throw new Error(RegisterErrors.USER_ALREADY_EXISTS);
  }
  return await addUserToDB(id);
};

export const searchUsers = async (query: { username?: string, limit?: string, nextKey?: string }) => {
  const username = query.username || '';
  let limit = query.limit || 10;
  if (typeof limit === 'string') {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      throw new Error(SearchUsersErrors.LIMIT_MUST_BE_NUMBER);
    }

    if (limit <= 0) {
      throw new Error(SearchUsersErrors.LIMIT_MUST_BE_GREATER_THAN_0);
    }
  }

  let nextKey = query.nextKey;
  if (nextKey) {
    const uriDecoded = decodeURIComponent(nextKey);
    console.log('uriDecoded', uriDecoded);
    try {
      nextKey = JSON.parse(uriDecoded);
      console.log('nextKey', nextKey);
    }
    catch (e) {
      console.log(e);
      throw new Error(SearchUsersErrors.NEXT_KEY_INVALID);
    }

    if (!(nextKey as any).id) {
      throw new Error(SearchUsersErrors.NEXT_KEY_INVALID);
    }
  }

  return await getUsersByUsername(username, limit, nextKey);
};

export const subscribeToChannel = async (userId: string, channelId: string) => {
  if (userId === channelId) {
    throw new Error(SubscribeChannelErrors.CANNOT_SUBSCRIBE_SAME_ID);
  }

  const user = await getProfile(userId);

  if (!user) {
    throw new Error(SubscribeChannelErrors.USER_NOT_FOUND);
  }

  const targetUser = await getProfile(channelId);

  if (!targetUser) {
    throw new Error(SubscribeChannelErrors.TARGET_NOT_FOUND);
  }

  if (user.subscribedChannels.includes(channelId)) {
    return;
  }

  return await subscribeToUser(userId, channelId);
};

export const unsubscribeFromChannel = async (userId: string, channelId: string) => {
  if (userId === channelId) {
    throw new Error(UnsubscribeChannelErrors.CANNOT_UNSUBSCRIBE_SAME_ID);
  }

  const user = await getProfile(userId);

  if (!user) {
    throw new Error(UnsubscribeChannelErrors.USER_NOT_FOUND);
  }

  const targetUser = await getProfile(channelId);

  if (!targetUser) {
    throw new Error(UnsubscribeChannelErrors.TARGET_NOT_FOUND);
  }

  if (!user.subscribedChannels.includes(channelId)) {
    return;
  }

  return await unsubscribeFromUser(userId, channelId);
};

export const editUsername = async (userId: string, newUsername: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(ChangeUsernameErrors.USER_NOT_FOUND);
  }

  if (!newUsername.trim()) {
    throw new Error(ChangeUsernameErrors.INVALID_USERNAME);
  }

  if (user.username === newUsername) {
    return;
  }

  await changeUsername(userId, newUsername.trim());
};

export const changeAvatar = async (userId: string) => {
  return await generatePresignedUrlForAvatar(userId);
}

export const getSubscribedChannels = async (userId: string) => {
  return await _getSubscribedChannels(userId);
};

export const resizeAvatar = async (key: string) => {
  const buffer = await resizeImage(`https://udatube-avatars-dev.s3.amazonaws.com/${key}`, 500, 500);
  if (!buffer) {
    return;
  }
  return await resizeAvatarToS3(buffer, key);
};