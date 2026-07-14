import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'tenant' | 'landlord';
  createdAt?: Date;
}

export interface Property {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  landlordId: ObjectId;
  createdAt?: Date;
}

export interface RentalRequest {
  _id?: ObjectId;
  propertyId: ObjectId;
  tenantId: ObjectId;
  landlordId: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
  contactNumber: string;
  createdAt?: Date;
}

export interface Review {
  _id?: ObjectId;
  propertyId: ObjectId;
  tenantId: ObjectId;
  tenantName: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt?: Date;
}
