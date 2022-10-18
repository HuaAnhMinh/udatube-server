export type Video = {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  dislikes: string[];
  totalViews: number;
  username?: string;
};

export type ShortFormVideo = {
  id: string;
  userId: string;
  title: string;
  likes: number;
  dislikes: number;
  totalViews: number;
  username?: string;
};