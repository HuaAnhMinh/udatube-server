import {getProfile} from "./user";
import {findVideoById} from "./video";
import { createComment as _createComment, findCommentsByVideoIdWithPagination as findComments } from '../dataLayer/comment';
import CreateCommentErrors from "../errors/CreateCommentErrors";
import GetCommentsErrors from "../errors/GetCommentsErrors";

export const createComment = async (userId: string, videoId: string, comment: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(CreateCommentErrors.FOUND_NO_USER);
  }

  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(CreateCommentErrors.FOUND_NO_VIDEO);
  }

  if (comment.trim()) {
    return await _createComment(userId, videoId, comment.trim());
  }
};

export const getComments = async (query: { videoId?: string; limit?: string; nextKey?: string }) => {
  const videoId = query.videoId;
  const video = await findVideoById(videoId);
  if (!video) {
    throw new Error(GetCommentsErrors.FOUND_NO_VIDEO);
  }

  let limit = query.limit || 10;
  if (typeof limit === 'string') {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      throw new Error(GetCommentsErrors.LIMIT_MUST_BE_NUMBER);
    }

    if (limit <= 0) {
      throw new Error(GetCommentsErrors.LIMIT_MUST_BE_GREATER_THAN_0);
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
      throw new Error(GetCommentsErrors.NEXT_KEY_INVALID);
    }

    if (!(nextKey as any).id) {
      throw new Error(GetCommentsErrors.NEXT_KEY_INVALID);
    }
  }

  return await findComments(videoId, limit, nextKey);
};