# DynamoDB Tables

This project has 3 tables:

* Users:
  * Key: id - generated using uuid v4 and hashed with SHA256 to shorten the string.
  * Usage:
    * Search videos using search bar: using scan with Limit has ExclusiveStartKey and Projection only a few properties because when fetching all users, method query is not suitable for this use case even though it is efficient on large datasets.
* Videos:
  * Key: id - generated using uuid v4 and hashed with SHA256 to shorten the string.
  * Global secondary index:
    * Partition key: userId
    * Range key: updatedAt
  * Usage:
    * Search videos using search bar: using `scan` with Limit has ExclusiveStartKey and Projection only a few properties because when fetching all videos, method `query` is not suitable for this use case even though it is efficient on large datasets.
    * Search videos of a user: using `query` with global secondary index, partition by user id and sort by last updated time.
* Comments:
  * Key: id - generated using uuid v4 and hashed with SHA256 to shorten the string.
  * Global secondary index:
      * Partition key: videoId
      * Range key: createdAt
  * Usage:
    * Fetch comments of a video: using `query` with global secondary index, partition by video id and sort by create time

# S3 Buckets

This project has 3 buckets:

* avatars: contains avatar for each user. Key for each avatar is the corresponding user id.
* videos: contains video. Key for each video is the corresponding video id.
* thumbnails: contains thumbnail for each video. Key for each thumbnail is the corresponding video id.

With videos and thumbnails bucket, when a user request api to upload video or thumbnail, it will trigger a S3 event and push to videos SNS topic. This topic will call a lambda function to update the last updated time to the video in DynamoDB.