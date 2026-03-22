export class GetDogProfileResponse {
  header: DogProfileHeader;
  profile: DogProfileSection;
  vaccine: DogProfileVaccine;
  serviceHistory: DogProfileServiceHistory;
}

export class DogProfileHeader {
  dogId: number;
  displayName: string;
  imageUrl: string | null;
  badges: DogProfileBadges;
  qr: DogProfileQr;
}

export class DogProfileBadges {
  alertLabel?: string;
}

export class DogProfileQr {
  code: string;
  imageCode: string;
}

export class DogProfileSection {
  general: DogProfileGeneral;
  careInfo: DogProfileCareInfo;
  extraNote?: string | null;
}

export class DogProfileGeneral {
  name: string;
  gender: string;
  age: string | null;
  weightKg: string;
  heightCm: string | null;
  breed: string;
  color: string | null;
  coatType: string;
  size: string;
  birthday: string | null;
}

export class DogProfileCareInfo {
  sterilized: boolean;
  microchip: boolean;
  bloodType: string;
  disease: string;
  allergy: string;
  mealsPerDay: number;
  feedingTime: DogProfileFeedingTime;
}

export class DogProfileFeedingTime {
  hasBreakfast: boolean;
  hasAfterBreakfast: boolean;
  hasLunch: boolean;
  hasAfterLunch: boolean;
  hasDinner: boolean;
}

export class DogProfileVaccine {
  vaccineList: DogProfileVaccineItem[];
}

export class DogProfileVaccineItem {
  date: Date | string;
  vaccineName: string;
  dose: number;
  clinicName: string;
  evidenceImageUrl: string;
}

export class DogProfileServiceHistory {
  swimmingHistoryList: DogProfileSwimmingHistoryItem[];
  boardingHistoryList: DogProfileBoardingHistoryItem[];
}

export class DogProfileSwimmingHistoryItem {
  serviceName: string;
  date: string;
  timeSlot: { start: string; end: string };
  bookingRef: string;
}

export class DogProfileBoardingHistoryItem {
  serviceName: string;
  checkIn: string;
  checkOut: string;
  bookingRef: string;
}