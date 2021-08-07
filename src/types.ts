export type User = {
  username: string;
  age: number;
  dateOfBirth: Date;
  isOnline: boolean;
};

export type UserMutationResponse = {
  user: User;
  success: boolean;
};
