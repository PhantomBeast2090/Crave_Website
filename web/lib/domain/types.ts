// Domain types — mirrors Android domain/model + Supabase 001-017.
// Prices in INR rupees. Server is authoritative for price/tax/eligibility.

export type UserRole = "STUDENT" | "VENDOR" | "ADMIN" | "PENDING_VENDOR";
export type OrderStatus = "CREATED" | "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "PICKED_UP" | "REJECTED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CREATED" | "AUTHORIZED" | "CAPTURED";
export type PaymentMethod = "PAY_AT_COUNTER" | "ONLINE";
export type SlotStatus = "AVAILABLE" | "LIMITED" | "FULL";
export type ReviewStatus = "pending" | "published" | "hidden" | "reported" | "moderated";

export interface Outlet { id: string; slug: string; name: string; description: string; image?: string; isOpen: boolean; isActive: boolean; rating: number; totalReviews: number; location: string; pickupEtaMin: number; cuisines: string[]; queue: "short" | "medium" | "long"; }
export interface VariantOption { id: string; name: string; extraPrice: number; }
export interface Variant { id: string; name: string; required: boolean; maxSelections: number; options: VariantOption[]; }
export interface FoodItem {
  id: string; slug: string; outletId: string; outletName: string; name: string; description: string;
  image?: string; price: number; isVeg: boolean; isAvailable: boolean; prepMin: number;
  rating: number; totalReviews: number; category: string; tags: string[]; isPopular?: boolean; calories?: number; ingredients?: string[];
  variants?: Variant[];
}
export interface CartLine { foodId: string; qty: number; options: { variantId: string; optionId: string }[]; instructions?: string; }
export interface Coupon { code: string; description: string; minOrder: number; maxDiscount?: number; kind: "PERCENT" | "FLAT"; value: number; }
export interface OrderItem { foodId: string; name: string; qty: number; unitPrice: number; total: number; isVeg: boolean; options?: { variant: string; option: string; extra: number }[]; }
export interface Order {
  id: string; number: string; outletId: string; outletName: string; items: OrderItem[];
  subtotal: number; tax: number; total: number; status: OrderStatus;
  paymentStatus: PaymentStatus; paymentMethod: PaymentMethod;
  slotLabel: string; placedAt: string; qrToken?: string; instructions?: string;
}
export interface Review { id: string; user: string; date: string; rating: number; comment: string; verified: boolean; helpful: number; photos?: string[]; reply?: string; }
export interface NotificationItem { id: string; title: string; body: string; orderId?: string; read: boolean; createdAt: string; }

export const ORDER_FLOW: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP"];
export const ORDER_COPY: Record<OrderStatus, string> = {
  CREATED: "Order received", PLACED: "Order received", ACCEPTED: "Kitchen got it",
  PREPARING: "Cooking now", READY: "Ready to grab", PICKED_UP: "Enjoy",
  REJECTED: "Not accepted", CANCELLED: "Cancelled", EXPIRED: "Expired", REFUNDED: "Refunded",
};

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
