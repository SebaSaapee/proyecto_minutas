export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
