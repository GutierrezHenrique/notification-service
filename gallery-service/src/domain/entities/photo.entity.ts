import { Album } from './album.entity';

export class Photo {
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
  album?: Album;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Photo>) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description;
    this.filename = data.filename || '';
    this.originalName = data.originalName || '';
    this.mimeType = data.mimeType || '';
    this.size = data.size || 0;
    this.acquisitionDate = data.acquisitionDate;
    this.dominantColor = data.dominantColor;
    this.albumId = data.albumId || '';
    this.album = data.album;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}
