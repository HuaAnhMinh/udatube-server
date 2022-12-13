import {getProfile} from "./user";
import {
  createVideo as addVideo,
  deleteVideo as removeVideo,
  findVideoById as findVideo,
  generatePresignedUrlUploadThumbnail,
  generatePresignedUrlUploadVideo,
  getVideos as fetchVideos,
  getVideosByUserId as fetchVideosByUserId,
  increaseVideoViews,
  reactVideo as _reactVideo,
  resizeThumbnailToS3,
  unreactVideo as _unreactVideo,
  updateVideo as _updateVideo,
} from '../dataLayer/video';
import {resizeImage} from "@libs/image";
import * as console from "console";
import Errors from "../errors/Errors";
import {ShortFormVideo, Video} from "../models/video";

/**
 * @param {string} userId id of user that is creating video
 * @param {string} title Video title
 * @param {string} description Video description
 * @returns {Video} Created video
 * @throws {Errors.UserNotFound, Errors.InvalidTitle, Errors.UnknownError}
 * */
export const createVideo = async (userId: string, title: string, description: string): Promise<Video> => {
  const user = await getProfile(userId);

  if (!title.trim()) {
    console.log(`INFO/BusinessLayer/video.ts/createVideo Title cannot be empty. Requested by user with id ${userId}`);
    throw Errors.InvalidTitle;
  }

  try {
    const video = await addVideo(user.id, title.trim(), description.trim());
    console.log(`INFO/BusinessLayer/video.ts/createVideo Video with id ${video.id} has been created by user with id ${user.id}`);
    return video;
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/video.ts/createVideo Unknown error when creating video by user with id ${user.id}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} videoId Id of video to get
 * @param {boolean} increaseView if true, increase total views of video
 * @param {string} userId If exists, check if the video was created by user
 * @returns {Promise<Video>} video to get
 * @throws {Errors.VideoNotFound, Errors.UnknownError}
 * */
export const findVideoById = async (videoId: string, increaseView?: boolean, userId?: string): Promise<Video> => {
  let video: Video;
  try {
    video = await findVideo(videoId);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }

  if (!video) {
    console.log(`INFO/BusinessLayer/video.ts/findVideoById Video with id ${videoId} cannot be found`);
    throw Errors.VideoNotFound;
  }

  try {
    if (increaseView) {
      await increaseVideoViews(videoId);
    }
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/video.ts/findVideoById Error when increase total views for video with id ${videoId}. Error: ${e}`);
  }

  if (userId) {
    const user = await getProfile(userId);
    if (user.videos.indexOf(videoId) === -1) {
      throw Errors.VideoNotFound;
    }
  }

  video.username = (await getProfile(video.userId)).username;
  return video;
};

/**
 * @param {string} videoId Id of video to generate presigned url to upload video file
 * @param {string} userId Id of user who created the video
 * @returns {string} presigned url to upload video file
 * @throws {Errors.UserNotFound, Errors.VideoNotFound, Errors.InvalidPermissionToEditVideo, Errors.UnknownError}
 * */
export const uploadVideo = async (videoId: string, userId: string): Promise<string> => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);

  if (video.userId !== user.id) {
    console.log(`INFO/BusinessLayer/video.ts/uploadVideo User with id ${userId} is not the owner of video with id ${videoId}`);
    throw Errors.InvalidPermissionToEditVideo;
  }

  try {
    const url = await generatePresignedUrlUploadVideo(videoId);
    console.log(`INFO/BusinessLayer/video.ts/uploadVideo Presigned url to upload video file for video with id ${videoId} has been generated`);
    return url;
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/video.ts/uploadVideo Unknown error when generating presigned url to upload video file for video with id ${videoId}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} videoId Id of video to generate presigned url to upload thumbnail file
 * @param {string} userId Id of user who created the video
 * @returns {string} presigned url to upload thumnail file
 * @throws {Errors.UserNotFound, Errors.VideoNotFound, Errors.InvalidPermissionToEditVideo, Errors.UnknownError}
 * */
export const uploadThumbnail = async (videoId: string, userId: string): Promise<string> => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);

  if (video.userId !== user.id) {
    console.log(`INFO/BusinessLayer/video.ts/uploadVideo User with id ${userId} is not the owner of video with id ${videoId}`);
    throw Errors.InvalidPermissionToEditVideo;
  }

  try {
    const url = await generatePresignedUrlUploadThumbnail(videoId);
    console.log(`INFO/BusinessLayer/video.ts/uploadVideo Presigned url to upload thumbnail file for video with id ${videoId} has been generated`);
    return url;
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/video.ts/uploadVideo Unknown error when generating presigned url to upload thumbnail file for video with id ${videoId}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} query.userId? Id of user who is owner of videos to get
 * @param {string} query.title? Subtitle that is contained in videos title
 * @param {string} query.limit? Limit number of videos for each batch
 * @param {string} query.nextKey? Key for next batch of videos
 * @returns {Promise<{videos: ShortFormVideo[], nextKey: string}>}
 * @throws {Errors.LimitMustBeNumber, Errors.LimitMustBeGreaterThan0, Errors.InvalidNextKey, Errors.UserNotFound, Errors.UnknownError}
 * */
export const getVideos = async (query: { userId?: string, title?: string, limit?: string, nextKey?: string }):
  Promise<{videos: ShortFormVideo[], nextKey: string}> => {
  let limit = query.limit || 10;
  if (typeof limit === 'string') {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      console.log(`INFO/BusinessLayer/video.ts/getVideos The limit parameter must be number. Current value: ${query.limit}`);
      throw Errors.LimitMustBeNumber;
    }

    if (limit <= 0) {
      console.log(`INFO/BusinessLayer/video.ts/getVideos The limit parameter must be smaller than 0. Current value: ${query.limit}`);
      throw Errors.LimitMustBeGreaterThan0;
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
      console.log(`ERROR/BusinessLayer/video.ts/getVideos Invalid next key. Current value: ${nextKey}. Error: ${e.message}`);
      throw Errors.InvalidNextKey;
    }

    if (!(nextKey as any).id) {
      console.log(`ERROR/BusinessLayer/video.ts/getVideos Invalid next key. Current value: ${nextKey}. Current value: ${nextKey}`);
      throw Errors.InvalidNextKey;
    }
  }

  const title = query.title || '';
  let result: {videos: ShortFormVideo[], nextKey: string};
  if (query.userId) {
    const user = await getProfile(query.userId);
    try {
      result = await fetchVideosByUserId(user.id, title, limit, nextKey);
    }
    catch (e) {
      console.log(`ERROR/BusinessLayer/video.ts/getVideos Unknown error when fetch videos by user id. Error: ${e.message}`);
      throw Errors.UnknownError(e.message);
    }
  }
  else {
    try {
      result = await fetchVideos(title, limit, nextKey);
    }
    catch (e) {
      console.log(`ERROR/BusinessLayer/video.ts/getVideos Unknown error when fetch videos. Error: ${e.message}`);
      throw Errors.UnknownError(e.message);
    }
  }

  for (const video of result.videos) {
    video.username = (await getProfile(video.userId)).username;
  }
  console.log(`INFO/BusinessLayer/video.ts/getVideos Videos have been retrieved`);
  return result;
};

/**
 * @param {string} videoId Id of video to delete
 * @param {string} userId Id of user who is owner
 * @throws {Errors.UserNotFound, Errors.VideoNotFound, Errors.InvalidPermissionToEditVideo, Errors.UnknownError}
 * */
export const deleteVideo = async (videoId: string, userId: string) => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);

  if (video.userId !== user.id) {
    throw Errors.InvalidPermissionToEditVideo;
  }

  try {
    await removeVideo(videoId);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} videoId Id of video to update
 * @param {string} userId Id of user who is owner
 * @param {string} title New title
 * @param {string} description New description
 * @throws {Errors.UserNotFound, Errors.VideoNotFound, Errors.InvalidPermissionToEditVideo, Errors.InvalidTitle, Errors.UnknownError}
 * */
export const updateVideo = async (videoId: string, userId: string, title: string, description: string) => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);

  if (video.userId !== user.id) {
    throw Errors.InvalidPermissionToEditVideo;
  }

  if (!title.trim()) {
    throw Errors.InvalidTitle;
  }

  const updated = {};
  if (title.trim() && title !== video.title) {
    updated['title'] = title.trim();
  }

  if (description.trim() && description.trim() !== video.description) {
    updated['description'] = description.trim();
  }

  try {
    return await _updateVideo(videoId, updated);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};

export const updateVideoContent = async (key: string) => {
  const id = key.split('.')[0];
  const video = await findVideoById(id);
  if (!video) {
    throw Errors.VideoNotFound;
  }

  try {
    return await _updateVideo(id, { content: true });
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} videoId Id of video that is being reacted
 * @param {string} userId Id of user who is reacting
 * @param {'likes' | 'dislikes'} reaction Reaction type
 * @throws {Errors.UserNotFound, Errors.VideoNotFound, Errors.UnknownError}
 * */
export const reactVideo = async (videoId: string, userId: string, reaction: 'likes' | 'dislikes') => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);
  try {
    return await _reactVideo(video.id, user.id, reaction);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} videoId Id of video that is being unreacted
 * @param {string} userId Id of user who is unreacting
 * @param {'likes' | 'dislikes'} reaction Original reaction type
 * @throws {Errors.UserNotFound, Errors.VideoNotFound, Errors.UnknownError}
 * */
export const unreactVideo = async (videoId: string, userId: string, reaction: 'likes' | 'dislikes') => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);
  try {
    return await _unreactVideo(video.id, user.id, reaction);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
}

export const resizeThumbnail = async (key: string) => {
  const buffer = await resizeImage(`https://udatube-thumbnails-dev.s3.amazonaws.com/${key}`, 800, 450);
  if (!buffer) {
    throw Errors.InvalidImage;
  }
  try {
    return await resizeThumbnailToS3(buffer, key);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};