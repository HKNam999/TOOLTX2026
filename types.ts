export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this would be hashed. Stored plain for mock demo only.
  balance: number;
  role: UserRole;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g., MBBANK
  bankCode: string; // The specific BIN code, e.g., 970422
  accountNumber: string;
  accountName: string;
  logo: string; // filename or url
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  BUY_KEY = 'BUY_KEY'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  metadata?: any; // For extra details (key info, bank info)
}

export interface KeyProduct {
  id: string;
  durationLabel: string; // e.g., "1 Giờ", "10 Giờ"
  durationHours: number; // For calculation logic if needed, or just identifier
  price: number;
}

export interface GeneratedKey {
  id: string;
  keyString: string;
  userId: string;
  productName: string;
  purchaseDate: string;
  expiryDate: string;
}

export const BANKS_LIST = [
  { name: 'MBBANK', bin: '970422', shortName: 'MB' },
  { name: 'VietinBank', bin: '970415', shortName: 'CTG' },
  { name: 'Techcombank', bin: '970407', shortName: 'TCB' },
  { name: 'Vietcombank', bin: '970436', shortName: 'VCB' },
  { name: 'BIDV', bin: '970418', shortName: 'BIDV' },
  { name: 'VPBank', bin: '970432', shortName: 'VPB' },
  { name: 'Agribank', bin: '970405', shortName: 'VBA' },
  { name: 'ACB', bin: '970416', shortName: 'ACB' },
];