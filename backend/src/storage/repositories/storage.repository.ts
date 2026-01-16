export interface UploadFileResult {
  filename: string;
  url: string;
  key: string;
}

export abstract class StorageRepository {
  abstract uploadFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<UploadFileResult>;
  abstract deleteFile(key: string): Promise<void>;
  abstract getFileUrl(key: string): Promise<string>;
}
