export interface PassengerDetails {
  name: string;
  passportNumber: string;
  nationality: string;
  seat: string;
  mealPreference: string;
  specialAssistance: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  airlineCode: string;
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  layovers: string[];
  fare: number;
  discount: number;
  class: string;
  seatsAvailable: number;
  carbonEmission: string;
  baggage: string;
  refundable: boolean;
}

export interface Booking {
  id: string;
  pnr: string;
  flightId: string;
  flightNumber: string;
  airline: string;
  source: string;
  sourceCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  passengers: PassengerDetails[];
  class: string;
  fare: number;
  discount: number;
  taxes: number;
  totalFare: number;
  paymentMethod: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  bookingDate: string;
}

export interface Notification {
  id: string;
  type: string; // "delay" | "gate" | "offer"
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface PricingRule {
  id: string;
  name: string;
  criteria: string;
  markup: string;
  active: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

export type PortalType = "passenger" | "operator" | "admin";
