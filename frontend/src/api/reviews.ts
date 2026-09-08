import apiClient from './axios';
import { ApiResponse, PageResponse } from './health';

export interface PublicBusinessReviewInfo {
  businessId: number;
  name: string;
  businessType: string;
  logo?: string;
  reviewSlug: string;
  reviewPromptMessage: string;
  publicReviewUrl?: string;
  reviewEnabled: boolean;
}

export interface SubmitReviewRequest {
  rating: number;
  feedbackText?: string;
  customerName?: string;
  customerContact?: string;
  redirectedToPublicPlatform?: boolean;
}

export interface Review {
  id: number;
  businessId: number;
  rating: number;
  feedbackText?: string;
  customerName?: string;
  customerContact?: string;
  positive: boolean;
  redirectedToPublicPlatform: boolean;
  hidden: boolean;
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingDistributionItem {
  stars: number;
  count: number;
  percentage: number;
}

export interface ReviewAnalytics {
  averageRating: number;
  totalReviews: number;
  positiveReviewsCount: number;
  positivePercentage: number;
  publicPlatformRedirectsCount: number;
  ratingDistribution: RatingDistributionItem[];
  recentReviews: Review[];
}

export interface ReviewSettings {
  businessId: number;
  businessName: string;
  reviewSlug: string;
  publicReviewUrl?: string;
  reviewPromptMessage?: string;
  reviewEnabled: boolean;
  directReviewPageUrl: string;
}

export interface ReviewSettingsRequest {
  reviewSlug?: string;
  publicReviewUrl?: string;
  reviewPromptMessage?: string;
  reviewEnabled?: boolean;
}

export interface QrCodeResponse {
  businessId: number;
  businessName: string;
  reviewSlug: string;
  reviewUrl: string;
  qrCodeDataUrl: string;
}

export interface ReviewFilterParams {
  rating?: number;
  isPositive?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const reviewsApi = {
  // Public Unauthenticated APIs
  getPublicReviewInfo: async (slugOrId: string): Promise<PublicBusinessReviewInfo> => {
    const res = await apiClient.get<ApiResponse<PublicBusinessReviewInfo>>(`/public/reviews/${slugOrId}`);
    return res.data.data;
  },

  submitPublicReview: async (slugOrId: string, data: SubmitReviewRequest): Promise<Review> => {
    const res = await apiClient.post<ApiResponse<Review>>(`/public/reviews/${slugOrId}`, data);
    return res.data.data;
  },

  // Authenticated Business APIs
  getReviews: async (params?: ReviewFilterParams): Promise<PageResponse<Review>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Review>>>('/reviews', {
      params,
    });
    return res.data.data;
  },

  getAnalytics: async (): Promise<ReviewAnalytics> => {
    const res = await apiClient.get<ApiResponse<ReviewAnalytics>>('/reviews/analytics');
    return res.data.data;
  },

  getSettings: async (): Promise<ReviewSettings> => {
    const res = await apiClient.get<ApiResponse<ReviewSettings>>('/reviews/settings');
    return res.data.data;
  },

  updateSettings: async (data: ReviewSettingsRequest): Promise<ReviewSettings> => {
    const res = await apiClient.put<ApiResponse<ReviewSettings>>('/reviews/settings', data);
    return res.data.data;
  },

  getQrCode: async (): Promise<QrCodeResponse> => {
    const res = await apiClient.get<ApiResponse<QrCodeResponse>>('/reviews/qr-code');
    return res.data.data;
  },

  moderateReview: async (id: number, hidden: boolean, notes?: string): Promise<Review> => {
    const res = await apiClient.put<ApiResponse<Review>>(`/reviews/${id}/moderate`, null, {
      params: { hidden, notes },
    });
    return res.data.data;
  },
};
