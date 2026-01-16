export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  provider?: string | null;
  profilePicture?: string | null;
}
