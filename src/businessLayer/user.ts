import {
  createUser as addUserToDB,
  getUserById,
  getUsersByUsername,
  subscribeToUser,
  unsubscribeFromUser
} from "../dataLayer/user";
import RegisterErrors from "../errors/RegisterErrors";
import SubscribeChannelErrors from "../errors/SubscribeChannelErrors";

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

  console.log('User found: ', user);

  const targetUser = await getProfile(channelId);

  if (!targetUser) {
    throw new Error(SubscribeChannelErrors.TARGET_NOT_FOUND);
  }

  console.log('Target user found: ', targetUser);

  if (user.subscribedChannels.includes(channelId)) {
    return;
  }

  return await subscribeToUser(userId, user.username, channelId, targetUser.username);
};

export const unsubscribeFromChannel = async (userId: string, channelId: string) => {
  if (userId === channelId) {
    throw new Error('User cannot unsubscribe from himself');
  }

  const user = await getProfile(userId);

  if (!user) {
    throw new Error(`User with id ${userId} not found`);
  }

  const targetUser = await getProfile(channelId);

  if (!targetUser) {
    throw new Error(`Target user with id ${channelId} not found`);
  }

  if (!user.subscribedChannels.includes(channelId)) {
    return;
  }

  return await unsubscribeFromUser(userId, user.username, channelId, targetUser.username);
}