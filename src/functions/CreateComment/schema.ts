export default {
  type: 'object',
  properties: {
    videoId: { type: 'string' },
    comment: { type: 'string' },
  },
  required: ['videoId', 'comment'],
};