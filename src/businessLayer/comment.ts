import {getProfile} from "./user";
import {findVideoById} from "./video";
import {
  createComment as _createComment,
  deleteComment as _deleteComment,
  findCommentById as _findCommentById,
  findCommentsByVideoId as findComments,
  updateComment as _updateComment,
} from '../dataLayer/comment';
import {Comment} from "../models/comment";
import Errors from "../errors/Errors";
import console from "console";

/**
 * @param {string} commentId Id of comment to get
 * @returns {Promise<Comment>}
 * @throws {Errors.CommentNotFound, Errors.UnknownError}
 * */
export const findCommentById = async (commentId: string): Promise<Comment> => {
  let comment: Comment;
  try {
    comment = await _findCommentById(commentId);
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }

  if (!comment) {
    throw Errors.CommentNotFound;
  }
  return comment;
};

/**
 * @param {string} userId Id of user who is commenting
 * @param {string} videoId Id of video which is being commented
 * @param {string} content Comment content
 * @returns {Promise<Comment>}
 * @throws {Errors.CommentIsEmpty, Errors.UserNotFound, Errors.VideoNotFound, Errors.UnknownError}
 * */
export const createComment = async (userId: string, videoId: string, content: string): Promise<Comment> => {
  const user = await getProfile(userId);
  const video = await findVideoById(videoId);

  if (!content.trim()) {
    console.log(`INFO/BusinessLayer/comment.ts/createComment User with id ${user.id} cannot create empty comment`);
    throw Errors.CommentIsEmpty;
  }

  try {
    const comment = await _createComment(user.id, video.id, content.trim());
    console.log(`INFO/BusinessLayer/comment.ts/createComment Comment with id ${comment.id} has been created by user with id ${user.id}`);
    return comment;
  }
  catch (e) {
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} query.videoId? Id of video to get comments
 * @param {string} query.limit? Limit number of comments each batch
 * @param {string} query.nextKey? Key to next batch of comments
 * @returns {Promise<{comments: Comment[], nextKey: string}>}
 * @throws {Errors.VideoNotFound, Errors.LimitMustBeNumber, Errors.LimitMustBeGreaterThan0, Errors.InvalidNextKey, Errors.UserNotFound, Errors.UnknownError}
 * */
export const getComments = async (query: { videoId?: string; limit?: string; nextKey?: string }):
  Promise<{comments: Comment[], nextKey: string}> => {
  const videoId = query.videoId;
  const video = await findVideoById(videoId);

  let limit = query.limit || 10;
  if (typeof limit === 'string') {
    limit = parseInt(limit);
    if (isNaN(limit)) {
      console.log(`INFO/BusinessLayer/comment.ts/getComments The limit parameter must be number. Current value: ${query.limit}`);
      throw Errors.LimitMustBeNumber;
    }

    if (limit <= 0) {
      console.log(`INFO/BusinessLayer/comment.ts/getComments The limit parameter must be smaller than 0. Current value: ${query.limit}`);
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
    } catch (e) {
      console.log(`ERROR/BusinessLayer/comment.ts/getComments Invalid next key. Current value: ${nextKey}. Error: ${e.message}`);
      throw Errors.InvalidNextKey;
    }

    if (!(nextKey as any).id) {
      console.log(`INFO/BusinessLayer/comment.ts/getComments Invalid next key. Current value: ${nextKey}. Current value: ${nextKey}`);
      throw Errors.InvalidNextKey;
    }
  }

  let result: {comments: Comment[], nextKey: string};
  try {
    result = await findComments(video.id, limit, nextKey);
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/comment.ts/getComments Unknown error when fetch comments. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }

  for (const comment of result.comments) {
    try {
      comment.username = (await getProfile(comment.userId)).username;
    }
    catch (e) {
      console.log(e);
    }
  }

  console.log(`INFO/BusinessLayer/comment.ts/getComments Comments have been retrieved`);
  return result;
};

/**
 * @param {string} id Id of comment to delete
 * @param {string} userId Id of user who commented
 * @throws {Errors.UserNotFound, Errors.CommentNotFound, Errors.InvalidPermissionToModifyComment, Errors.UnknownError}
 * */
export const deleteComment = async (id: string, userId: string) => {
  const user = await getProfile(userId);
  const comment = await findCommentById(id);

  if (comment.userId !== user.id) {
    console.log(`INFO/BusinessLayer/comment.ts/deleteComment User with id ${user.id} cannot delete comment created by user with id ${comment.id}`);
    throw Errors.InvalidPermissionToModifyComment;
  }

  try {
    await _deleteComment(id);
    console.log(`INFO/BusinessLayer/comment.ts/deleteComment Comment with id ${comment.id} has been deleted`);
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/comment.ts/deleteComment Unknown error when deleting comment with id ${comment.id}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};

/**
 * @param {string} id Id of comment to update
 * @param {string} userId Id of user who commented
 * @param {string} content New content
 * @throws {Errors.UserNotFound, Errors.CommentNotFound, Errors.InvalidPermissionToModifyComment, Errors.CommentIsEmpty, Errors.UnknownError}
 * */
export const updateComment = async (id: string, userId: string, content: string) => {
  const user = await getProfile(userId);
  const comment = await findCommentById(id);
  if (comment.userId !== user.id) {
    console.log(`INFO/BusinessLayer/comment.ts/updateComment User with id ${user.id} cannot update comment created by user with id ${comment.id}`);
    throw Errors.InvalidPermissionToModifyComment;
  }

  if (!content.trim()) {
    console.log(`INFO/BusinessLayer/comment.ts/updateComment User with id ${user.id} cannot update comment with id ${comment.id} to empty comment`);
    throw Errors.CommentIsEmpty;
  }

  try {
    if (comment.content !== content.trim()) {
      await _updateComment(id, content.trim());
      console.log(`INFO/BusinessLayer/comment.ts/updateComment Comment with id ${comment.id} has been updated to content: ${content}`);
    }
  }
  catch (e) {
    console.log(`ERROR/BusinessLayer/comment.ts/updateComment Unknown error when updating comment with id ${comment.id}. Error: ${e.message}`);
    throw Errors.UnknownError(e.message);
  }
};