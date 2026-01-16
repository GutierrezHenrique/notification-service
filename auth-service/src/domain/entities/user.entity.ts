export class User {
  id: string;
  email: string;
  password?: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  provider?: string | null;
  googleId?: string | null;
  profilePicture?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  emailVerificationToken?: string | null;
  emailVerified: boolean;

  constructor(data: Partial<User>) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.password = data.password || null;
    this.name = data.name || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.provider = data.provider || null;
    this.googleId = data.googleId || null;
    this.profilePicture = data.profilePicture || null;
    this.passwordResetToken = data.passwordResetToken || null;
    this.passwordResetExpires = data.passwordResetExpires || null;
    this.emailVerificationToken = data.emailVerificationToken || null;
    this.emailVerified = data.emailVerified ?? false;
  }
}
