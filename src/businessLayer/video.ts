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
import CreateVideoErrors from "../errors/CreateVideoErrors";
import UploadVideoErrors from "../errors/UploadVideoErrors";
import UploadThumbnailErrors from "../errors/UploadThumbnailErrors";
import GetVideosError from "../errors/GetVideosErrors";
import DeleteVideoErrors from "../errors/DeleteVideoErrors";
import SyncVideoUpdatedTimeErrors from "../errors/SyncVideoUpdatedTimeErrors";
import UpdateVideoErrors from "../errors/UpdateVideoErrors";
import ReactVideoErrors from "../errors/ReactVideoErrors";
import {resizeImage} from "@libs/image";
import * as console from "console";

export const createVideo = async (userId: string, title: string, description: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(CreateVideoErrors.USER_NOT_EXIST);
  }

  if (!title.trim()) {
    throw new Error(CreateVideoErrors.INVALID_TITLE);
  }

  return await addVideo(userId, title.trim(), description.trim());
};

export const findVideoById = async (videoId: string, increaseView?: boolean) => {
  try {
    if (increaseView) {
      await increaseVideoViews(videoId);
    }
  }
  catch (e) {
    console.log(e);
  }
  const video = await findVideo(videoId);
  video.username = (await getProfile(video.userId)).username;
  return video;
};

export const findVideoByIdToUpdate = async (videoId: string, userId: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(UpdateVideoErrors.FOUND_NO_USER);
  }

  if (user.videos.indexOf(videoId) === -1) {
    throw new Error(UpdateVideoErrors.FOUND_NO_VIDEO);
  }

  const video = await findVideo(videoId);
  if (!video) {
    throw new Error(UpdateVideoErrors.FOUND_NO_VIDEO);
  }
  return video;
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

export const getVideos = async (query: { userId?: string, title?: string, limit?: string, nextKey?: string }) => {
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

  let result;
  if (query.userId) {
    const user = await getProfile(query.userId);
    if (!user) {
      throw new Error(GetVideosError.FOUND_NO_USER);
    }
    result = await fetchVideosByUserId(query.userId, limit, nextKey);
  }
  else {
    const title = query.title || '';
    result = await fetchVideos(title, limit, nextKey);
  }

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

  if (!title.trim()) {
    throw new Error(UpdateVideoErrors.INVALID_TITLE);
  }

  const updated = {};
  if (title.trim() && title !== video.title) {
    updated['title'] = title.trim();
  }

  if (description.trim() && description.trim() !== video.description) {
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

export const resizeThumbnail = async (key: string) => {
  const buffer = await resizeImage(`https://udatube-thumbnails-dev.s3.amazonaws.com/${key}`, 800, 450);
  if (!buffer) {
    return
  }
  return await resizeThumbnailToS3(buffer, key);
};