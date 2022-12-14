export default {
  type: 'object',
  properties: {
    videoId: { type: 'string' },
    content: { type: 'string' },
  },
  required: ['videoId', 'content'],
};