export interface Photo {
  id: string;
  title: string;
  description: string;
  filename: string;
  size: number;
  acquisitionDate: string;
  dominantColor: string;
  albumId: string;
  url?: string;
  createdAt: string;
}
