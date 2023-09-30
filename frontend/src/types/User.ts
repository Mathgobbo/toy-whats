export type User = {
  id: string;
  username: string;
  phone: string;
  otpEnabled?: boolean;
  salt?: string;
};
