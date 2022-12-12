import {getProfile} from "./user";
import {findVideoById} from "./video";
import {
  createComment as _createComment,
  deleteComment as _deleteComment,
  findCommentById as _findCommentById,
  findCommentsByVideoId as findComments,
  updateComment as _updateComment,
} from '../dataLayer/comment';
import CreateCommentErrors from "../errors/CreateCommentErrors";
import GetCommentsErrors from "../errors/GetCommentsErrors";
import DeleteCommentErrors from "../errors/DeleteCommentErrors";
import UpdateCommentErrors from "../errors/UpdateCommentErrors";
import FindCommentErrors from "../errors/FindCommentErrors";

export const findCommentById = async (commentId: string) => {
  const comment = await _findCommentById(commentId);
  if (!comment) {
    throw new Error(FindCommentErrors.FOUND_NO_COMMENT);
  }
  return comment;
};

export const createComment = async (userId: string, videoId: string, content: string) => {
  const user = await getProfile(userId);

  const video = await findVideoById(videoId);

  if (!content.trim()) {
    throw new Error(CreateCommentErrors.CONTENT_IS_EMPTY);
  }

  return await _createComment(user.id, video.id, content.trim());
};

export const getComments = async (query: { videoId?: string; limit?: string; nextKey?: string }) => {
  const videoId = query.videoId;
  const video = await findVideoById(videoId);

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
    } catch (e) {
      console.log(e);
      throw new Error(GetCommentsErrors.NEXT_KEY_INVALID);
    }

    if (!(nextKey as any).id) {
      throw new Error(GetCommentsErrors.NEXT_KEY_INVALID);
    }
  }

  const result = await findComments(video.id, limit, nextKey);
  for (const comment of result.comments) {
    comment.username = (await getProfile(comment.userId)).username;
  }
  return result;
};

export const deleteComment = async (id: string, userId: string) => {
  const user = await getProfile(userId);

  const comment = await findCommentById(id);
  if (!comment) {
    throw new Error(DeleteCommentErrors.FOUND_NO_COMMENT);
  }

  if (comment.userId !== user.id) {
    throw new Error(DeleteCommentErrors.INVALID_PERMISSION);
  }

  return await _deleteComment(id);
};

export const updateComment = async (id: string, userId: string, content: string) => {
  const user = await getProfile(userId);
  if (!user) {
    throw new Error(UpdateCommentErrors.FOUND_NO_USER);
  }

  const comment = await findCommentById(id);
  if (!comment) {
    throw new Error(UpdateCommentErrors.FOUND_NO_COMMENT);
  }

  if (comment.userId !== userId) {
    throw new Error(UpdateCommentErrors.INVALID_PERMISSION);
  }

  if (!content.trim()) {
    throw new Error(UpdateCommentErrors.CONTENT_IS_EMPTY);
  }

  if (comment.content !== content.trim()) {
    await _updateComment(id, content.trim());
  }
};