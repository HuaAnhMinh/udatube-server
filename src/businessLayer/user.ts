import {
  changeUsername,
  createUser as addUserToDB, generatePresignedUrlForAvatar,
  getUserById,
  getUsersByUsername,
  subscribeToUser,
  unsubscribeFromUser
} from "../dataLayer/user";
import RegisterErrors from "../errors/RegisterErrors";
import SubscribeChannelErrors from "../errors/SubscribeChannelErrors";
import UnsubscribeChannelErrors from "../errors/UnsubscribeChannelErrors";
import ChangeUsernameErrors from "../errors/ChangeUsernameErrors";

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

export const searchUsers = async (username: string) => {
  return await getUsersByUsername(username);
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