import { Photo } from './photo.entity';

export class Album {
  id: string;
  title: string;
  description?: string;
  userId: string;
  photos?: Photo[];
  isPublic?: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Album>) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description;
    this.userId = data.userId || '';
    this.photos = data.photos;
    this.isPublic = data.isPublic || false;
    this.shareToken = data.shareToken;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
