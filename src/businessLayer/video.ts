import {getProfile} from "./user";
import {
  createVideo as addVideo,
  findVideoById as findVideo,
  generatePresignedUrlUploadThumbnail,
  generatePresignedUrlUploadVideo,
  getVideos as fetchVideos,
  deleteVideo as removeVideo,
  updateVideo as _updateVideo, increaseVideoViews,
  reactVideo as _reactVideo,
  unreactVideo as _unreactVideo,
} from '../dataLayer/video';
import CreateVideoErrors from "../errors/CreateVideoErrors";
import UploadVideoErrors from "../errors/UploadVideoErrors";
import UploadThumbnailErrors from "../errors/UploadThumbnailErrors";
import GetVideosError from "../errors/GetVideosErrors";
import DeleteVideoErrors from "../errors/DeleteVideoErrors";
import SyncVideoUpdatedTimeErrors from "../errors/SyncVideoUpdatedTimeErrors";
import UpdateVideoErrors from "../errors/UpdateVideoErrors";
import ReactVideoErrors from "../errors/ReactVideoErrors";

export const createVideo = async (userId: string, title: string, description: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(CreateVideoErrors.USER_NOT_EXIST);
  }

  if (!title.trim()) {
    throw new Error(CreateVideoErrors.INVALID_TITLE);
  }

  return await addVideo(userId, title.trim(), description);
};

export const findVideoById = async (videoId: string) => {
  try {
    await increaseVideoViews(videoId);
  }
  catch (e) {
    console.log(e);
  }
  return await findVideo(videoId);
};

export const uploadVideo = async (videoId: string, userId: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(UploadVideoErrors.USER_NOT_FOUND);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(UploadVideoErrors.VIDEO_NOT_FOUND);
  }

  if (video.userId !== user.id) {
    throw new Error(UploadVideoErrors.INVALID_PERMISSION);
  }

  return await generatePresignedUrlUploadVideo(videoId);
};

export const uploadThumbnail = async (videoId: string, userId: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(UploadThumbnailErrors.USER_NOT_FOUND);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(UploadThumbnailErrors.VIDEO_NOT_FOUND);
  }

  if (video.userId !== user.id) {
    throw new Error(UploadThumbnailErrors.INVALID_PERMISSION);
  }

  return await generatePresignedUrlUploadThumbnail(videoId);
};

export const getVideos = async (query: { title?: string, limit?: string, nextKey?: string }) => {
  const title = query.title || '';

  let limit = query.limit || 10;
  if (typeof limit === 'string') {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      throw new Error(GetVideosError.LIMIT_MUST_BE_NUMBER);
    }

    if (limit <= 0) {
      throw new Error(GetVideosError.LIMIT_MUST_BE_GREATER_THAN_0);
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
      throw new Error(GetVideosError.NEXT_KEY_INVALID);
    }

    if (!(nextKey as any).id) {
      throw new Error(GetVideosError.NEXT_KEY_INVALID);
    }
  }

  const result = await fetchVideos(title, limit, nextKey);
  for (const video of result.videos) {
    video.username = (await getProfile(video.userId)).username;
  }
  return result;
};

export const deleteVideo = async (videoId: string, userId: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(DeleteVideoErrors.FOUND_NO_USER);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(DeleteVideoErrors.FOUND_NO_VIDEO);
  }

  if (video.userId !== user.id) {
    throw new Error(DeleteVideoErrors.INVALID_PERMISSION);
  }

  return await removeVideo(videoId);
};

export const updateVideo = async (videoId: string, userId: string, title: string, description: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(UpdateVideoErrors.FOUND_NO_USER);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(UpdateVideoErrors.FOUND_NO_VIDEO);
  }

  if (video.userId !== user.id) {
    throw new Error(UpdateVideoErrors.INVALID_PERMISSION);
  }

  const updated = {};
  if (title.trim() && title !== video.title) {
    updated['title'] = title.trim();
  }

  if (description.trim() && description !== video.description) {
    updated['description'] = description.trim();
  }

  return await _updateVideo(videoId, updated);
};

export const updateVideoContent = async (key: string) => {
  const id = key.split('.')[0];
  const video = await findVideoById(id);
  if (!video) {
    throw new Error(SyncVideoUpdatedTimeErrors.FOUND_NO_VIDEO);
  }

  return await _updateVideo(id, { content: true });
};

export const reactVideo = async (videoId: string, userId: string, reaction: 'likes' | 'dislikes') => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(ReactVideoErrors.FOUND_NO_USER);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(ReactVideoErrors.FOUND_NO_VIDEO);
  }

  return await _reactVideo(videoId, userId, reaction);
};

export const unreactVideo = async (videoId: string, userId: string, reaction: 'likes' | 'dislikes') => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(ReactVideoErrors.FOUND_NO_USER);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(ReactVideoErrors.FOUND_NO_VIDEO);
  }

  return await _unreactVideo(videoId, userId, reaction);
}