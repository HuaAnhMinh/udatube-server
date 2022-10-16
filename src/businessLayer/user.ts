import {
  createUser as addUserToDB,
  getUserById,
  getUsersByUsername,
  subscribeToUser,
  unsubscribeFromUser
} from "../dataLayer/user";
import RegisterErrors from "../errors/RegisterErrors";
import SubscribeChannelErrors from "../errors/SubscribeChannelErrors";
import UnsubscribeChannelErrors from "../errors/UnsubscribeChannelErrors";

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

  return await subscribeToUser(userId, user.username, channelId, targetUser.username);
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

  return await unsubscribeFromUser(userId, user.username, channelId, targetUser.username);
}