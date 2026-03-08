export class DogOwnerProfileResponse {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  address: string | null;
  profilePictureUrl: string | null;
  isEmailVerified: boolean;
}
