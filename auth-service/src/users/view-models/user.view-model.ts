export class UserViewModel {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  provider?: string | null;
  profilePicture?: string | null;

  constructor(user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    provider?: string | null;
    profilePicture?: string | null;
  }) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.provider = user.provider;
    this.profilePicture = user.profilePicture;
  }
}
