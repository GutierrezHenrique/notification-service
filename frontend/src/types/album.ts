import { Photo } from './photo';

export interface Album {
  id: string;
  title: string;
  description: string;
  photos?: Photo[];
  createdAt: string;
  userId?: string;
  isPublic?: boolean;
  shareToken?: string;
}
