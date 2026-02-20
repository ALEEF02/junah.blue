export type LicenseType = 'exclusive' | 'non-exclusive' | 'split';

export interface ArtistProfile {
  _id?: string;
  name: string;
  headline: string;
  bio: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    spotify: string;
  };
}

export interface Beat {
  id: string;
  title: string;
  description: string;
  bpm?: number | null;
  key?: string;
  tags: string[];
  previewUrl: string;
  isAvailable: boolean;
  isActive: boolean;
  pricing: {
    exclusivePriceCents: number;
    nonExclusivePriceCents: number;
  };
  licenseOptions: LicenseType[];
}

export interface ContractTemplate {
  id: string;
  type: LicenseType;
  version: string;
  title: string;
  fullText: string;
  summaryText: string;
}

export interface ApparelVariant {
  id: number | string;
  title: string;
  priceCents: number;
  sku: string;
  isAvailable: boolean;
}

export interface ApparelProduct {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  variants: ApparelVariant[];
}

export interface OwnerUser {
  id: string;
  email: string;
  role: 'owner';
}

export interface OwnerOverview {
  totalBeats: number;
  activeBeats: number;
  totalOrders: number;
  agreements: number;
  grossRevenueCents: number;
}

export interface OwnerBeat {
  _id: string;
  title: string;
  description: string;
  bpm: number | null;
  key: string;
  tags: string[];
  previewFileKey: string;
  fullFileKey: string;
  exclusivePriceCents: number;
  nonExclusivePriceCents: number;
  isAvailable: boolean;
  isActive: boolean;
}

export interface OwnerOrder {
  _id: string;
  type: 'beat' | 'apparel';
  buyerEmail: string;
  buyerName: string;
  amountTotal: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

export interface OwnerContract {
  _id: string;
  templateType: LicenseType;
  beatTitle?: string;
  buyerName: string;
  buyerEmail: string;
  signedAt: string;
}
