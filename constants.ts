import { KeyProduct } from "./types";

export const APP_NAME = "TOOLTX2026";

export const KEY_PRICING: KeyProduct[] = [
  { id: '1h', durationLabel: '1 Giờ', durationHours: 1, price: 5000 },
  { id: '10h', durationLabel: '10 Giờ', durationHours: 10, price: 10000 },
  { id: '1d', durationLabel: '1 Ngày', durationHours: 24, price: 20000 },
  { id: '3d', durationLabel: '3 Ngày', durationHours: 72, price: 45000 },
  { id: '7d', durationLabel: '7 Ngày', durationHours: 168, price: 80000 },
  { id: '1m', durationLabel: '1 Tháng', durationHours: 720, price: 120000 },
  { id: 'forever', durationLabel: 'Vĩnh Viễn', durationHours: 999999, price: 250000 },
];

export const getDiscount = (quantity: number): number => {
  if (quantity >= 10) return 0.35; // 35%
  if (quantity >= 6) return 0.25; // 25%
  if (quantity >= 3) return 0.15; // 15%
  return 0;
};

export const LOGO_URL = "https://picsum.photos/seed/logo-vip/200/200"; // Placeholder for logo-vip.png