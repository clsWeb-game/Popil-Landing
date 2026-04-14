export type SubscriptionEntitlements = {
  access_songs: boolean;
  access_movies: boolean;
  access_series: boolean;
  access_videos: boolean;
  access_clips: boolean;
  access_karaoke: boolean;
  access_library: boolean;
  access_playlists: boolean;
  access_buddies: boolean;
  likes_activity_access: boolean;
  clip_creation_access: boolean;
  clip_daily_limit: number;
  max_stream_quality: string;
  content_restriction_level: string;
  ads_required: boolean;
  priority_content_access: boolean;
  unlimited_access_flag: boolean;
};

export type SubscriptionPlan = {
  _id: string;
  slug: string;
  active: boolean;
  /** When false, hidden from user plan list (admin toggle); optional for older API responses */
  visibility?: boolean;
  currency: string;
  description: string;
  durationDays: number;
  entitlements: SubscriptionEntitlements;
  name: string;
  price: number;
  sortOrder: number;
};

export type SubscriptionPlansResponse = {
  status: "success" | "fail";
  results: number;
  data: SubscriptionPlan[];
};

export type MySubscriptionResponse = {
  status: "success" | "fail";
  subscription: {
    status: string;
    startsAt: string | null;
    endsAt: string | null;
    plan: {
      id: string;
      name: string;
      slug: string;
      price: number;
      currency: string;
      durationDays: number;
    };
  };
  entitlements: SubscriptionEntitlements;
};

export type CreateRazorpayResponse = {
  status: "success" | "fail";
  keyId: string;
  checkoutType: "subscription" | "order";
  subscriptionId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    durationDays: number;
  };
  userPrefill: {
    name: string;
    email: string;
    contact: string;
  };
};

export type VerifyRazorpayResponse = {
  status: "success" | "fail";
  message: string;
  data: Record<string, unknown>;
};

export type RazorpayPaymentResult = {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
};
