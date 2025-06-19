import { User } from './user';

export interface Doctor extends User {
  specialization: string;
  experience: number;
  profilePicture?: string;
  isAdmin: boolean;
  bio?: string;
  education?: {
    degree: string;
    university: string;
    year: number;
  }[];
  contactNumber?: string;
  address?: string;
  consultationFee?: number;
  availableHours?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  ratings?: {
    userId: string;
    rating: number;
    review?: string;
    date: Date;
  }[];
  averageRating?: number;
  totalRatings?: number;
  services?: string[];
  languages?: string[];
  hospitalAffiliations?: {
    name: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }[];
  certifications?: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expirationDate?: Date;
  }[];
  socialMedia?: {
    platform: string;
    url: string;
  }[];
  isVerified?: boolean;
  isActive?: boolean;
  lastActive?: Date;
  timezone?: string;
}
