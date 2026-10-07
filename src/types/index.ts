export type Role = "USER" | "ADMIN" | "OPERATOR";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  createdAt?: string;
}

export interface ParkingLot {
  id: number;
  name: string;
  state: string;
  city: string;
  area: string;
  locality?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  rate: number;
  active: boolean;
  vacant?: number;
  occupied?: number;
  reserved?: number;
  maintenance?: number;
  totalSlots?: number;
}

export type SlotStatus = "VACANT" | "RESERVED" | "OCCUPIED" | "MAINTENANCE";
export type VehicleType = "ANY" | "CAR" | "BIKE" | "EV";

export interface ParkingSlot {
  id: number;
  parkingLotId: number;
  slotCode: string;
  slotStatus: SlotStatus;
  vehicleType: VehicleType;
  updatedAt?: string;
}

export type BookingStatus =
  | "RESERVED"
  | "PARKED"
  | "COMPLETED"
  | "CANCELLED"
  | "ENTRY_REVIEW"
  | "EXIT_REVIEW";

export interface Booking {
  id: number;
  bookingCode: string;
  userId: number;
  parkingLotId: number;
  parkingSlotId: number;
  parkingName?: string;
  slotCode?: string;
  city?: string;
  area?: string;
  vehicleType: string;
  carType: string;
  carNumber: string;
  durationHours: number;
  startTime: string;
  endTime?: string | null;
  amount: number;
  status: BookingStatus;
  createdAt: string;
  paymentStatus?: "PAID" | "PENDING" | "FAILED";
  transactionId?: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  bookingCode?: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED";
  paymentMethod: string;
  transactionId: string;
  paidAt?: string;
  createdAt: string;
}

export interface AccessLog {
  id: number;
  bookingId: number;
  bookingCode?: string;
  eventType: "ENTRY" | "EXIT";
  detectedPlate?: string;
  expectedPlate: string;
  plateMatch: boolean;
  ocrConfidence?: number;
  eventTime: string;
  notes?: string;
  parkingName?: string;
  slotCode?: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminSummary {
  users: number;
  lots: number;
  slots: number;
  vacant: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  bookings: number;
  activeBookings: number;
  completed: number;
  revenue: number;
  pendingPayments: number;
}
