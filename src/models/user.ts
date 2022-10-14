export type User = {
  id: string;
  username: string;
  subscribedChannels: string[];
  videos: string[];
  totalSubscribers: number;
};

export type ShortFormUser = {
  id: string;
  username: string;
  totalSubscribers: number;
};