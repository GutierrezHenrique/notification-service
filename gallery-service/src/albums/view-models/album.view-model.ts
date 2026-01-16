export class AlbumViewModel {
  id: string;
  title: string;
  description?: string;
  userId: string;
  isPublic?: boolean;
  shareToken?: string;
  photos?: Array<{
    id: string;
    title: string;
    description?: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    acquisitionDate?: Date;
    dominantColor?: string;
    albumId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;

  constructor(album: {
    id: string;
    title: string;
    description?: string;
    userId: string;
    isPublic?: boolean;
    shareToken?: string;
    photos?: Array<{
      id: string;
      title: string;
      description?: string;
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      acquisitionDate?: Date;
      dominantColor?: string;
      albumId: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = album.id;
    this.title = album.title;
    this.description = album.description;
    this.userId = album.userId;
    this.isPublic = album.isPublic;
    this.shareToken = album.shareToken;
    this.photos = album.photos;
    this.createdAt = album.createdAt;
    this.updatedAt = album.updatedAt;
  }
}
