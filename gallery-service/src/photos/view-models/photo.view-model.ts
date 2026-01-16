export class PhotoViewModel {
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
  url?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(photo: {
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
    url?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = photo.id;
    this.title = photo.title;
    this.description = photo.description;
    this.filename = photo.filename;
    this.originalName = photo.originalName;
    this.mimeType = photo.mimeType;
    this.size = photo.size;
    this.acquisitionDate = photo.acquisitionDate;
    this.dominantColor = photo.dominantColor;
    this.albumId = photo.albumId;
    this.url = photo.url;
    this.createdAt = photo.createdAt;
    this.updatedAt = photo.updatedAt;
  }
}
