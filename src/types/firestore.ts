export type UserRole = "CUSTOMER" | "RESTAURANT" | "ADMIN";

export interface UserDocument {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface Restaurant {
  id: string; // The uid of the owner for now (1:1 mapping)
  ownerId: string;
  name: string;
  address: string;
  phone: string;
  cuisine: string;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  restaurantId: string;
  planId: "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE";
  expiresAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  order: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  image?: string;
}

export type TableShape = "circle" | "rect";

export interface Table {
  id: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  shape: "rect" | "circle";
  isVip?: boolean;
  area?: string; // e.g. "Main Hall", "A/C", "Outdoor"
  positionX: number; // 0-100 percentage (Legacy)
  positionY: number; // 0-100 percentage (Legacy)
}

export interface RestaurantSettings {
  id: string; // usually same as user.uid
  name: string;
  phone: string;
  address: string;
  description: string;
  logoUrl?: string;
  cuisineType?: string;
  coverImage?: string;
  operatingHours: {
    [key: string]: { isOpen: boolean; open: string; close: string }
  };
}

export interface Booking {
  id: string;
  restaurantId: string;
  guestName: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  guests: number;
  tableId: string | null;
  tableNumber?: string | null;
  status: "Upcoming" | "Seated" | "Completed" | "Cancelled";
  kitchenStatus?: "Pending" | "Cooking" | "Ready";
  tags: string[];
  preOrders?: {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  createdAt: number;
  hasReviewed?: boolean;
  customerId?: string;
}

export type ReservationStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED";

export interface PreOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  tableId: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  status: ReservationStatus;
  preOrders: PreOrderItem[];
  createdAt: string;
}
