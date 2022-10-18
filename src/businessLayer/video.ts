import {getProfile} from "./user";
import {
  createVideo as addVideo,
  findVideoById as findVideo,
  generatePresignedUrlUploadThumbnail,
  generatePresignedUrlUploadVideo,
  getVideos as fetchVideos,
  deleteVideo as removeVideo,
  updateVideo as _updateVideo,
} from '../dataLayer/video';
import CreateVideoErrors from "../errors/CreateVideoErrors";
import UploadVideoErrors from "../errors/UploadVideoErrors";
import UploadThumbnailErrors from "../errors/UploadThumbnailErrors";
import GetVideosError from "../errors/GetVideosError";
import DeleteVideoErrors from "../errors/DeleteVideoErrors";
import SyncVideoUpdatedTimeErrors from "../errors/SyncVideoUpdatedTimeErrors";

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
    throw new Error();
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error();
  }

  if (video.userId !== user.id) {
    throw new Error();
  }

  return await _updateVideo(videoId, {title, description});
};

export const updateVideoContent = async (key: string) => {
  const id = key.split('.')[0];
  const video = await findVideoById(id);
  if (!video) {
    throw new Error(SyncVideoUpdatedTimeErrors.FOUND_NO_VIDEO);
  }

  return await _updateVideo(id, { content: true });
};