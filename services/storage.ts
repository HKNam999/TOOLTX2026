import { User, Transaction, BankAccount, GeneratedKey, UserRole, TransactionType, TransactionStatus } from "../types";
import { BANKS_LIST } from "../types";

// Keys for local storage
const LS_KEYS = {
  USERS: 'tooltx_users',
  CURRENT_USER: 'tooltx_current_user',
  TRANSACTIONS: 'tooltx_transactions',
  KEYS: 'tooltx_keys',
  ADMIN_BANKS: 'tooltx_admin_banks'
};

// Initial Seed Data
const seedData = () => {
  if (!localStorage.getItem(LS_KEYS.USERS)) {
    const adminUser: User = {
      id: 'admin-01',
      username: 'admin',
      password: 'Nam14112009', // In real app, never store plain text
      balance: 10000000,
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify([adminUser]));
  }

  if (!localStorage.getItem(LS_KEYS.ADMIN_BANKS)) {
    const defaultBank: BankAccount = {
      id: 'bank-1',
      bankName: 'MBBANK',
      bankCode: '970422',
      accountNumber: '0987654321',
      accountName: 'NGUYEN VAN ADMIN',
      logo: 'mbbank.png'
    };
    localStorage.setItem(LS_KEYS.ADMIN_BANKS, JSON.stringify([defaultBank]));
  }
};

seedData();

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // --- AUTH ---
  login: async (username: string, password: string): Promise<User> => {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error("Tài khoản hoặc mật khẩu không đúng!");
    
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  register: async (username: string, password: string): Promise<User> => {
    await delay(500);
    const users: User[] = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
    if (users.find(u => u.username === username)) throw new Error("Tên đăng nhập đã tồn tại!");

    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      password,
      balance: 0,
      role: UserRole.USER,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(LS_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(LS_KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  },

  refreshUser: (): User | null => {
    const current = storageService.getCurrentUser();
    if(!current) return null;
    const users: User[] = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
    const fresh = users.find(u => u.id === current.id) || null;
    if(fresh) localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(fresh));
    return fresh;
  },

  // --- WALLET / TRANSACTIONS ---
  createDepositOrder: async (userId: string, amount: number, bankId: string): Promise<Transaction> => {
    await delay(300);
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(LS_KEYS.TRANSACTIONS) || '[]');
    const banks: BankAccount[] = JSON.parse(localStorage.getItem(LS_KEYS.ADMIN_BANKS) || '[]');
    const bank = banks.find(b => b.id === bankId);
    
    if(!bank) throw new Error("Ngân hàng không tồn tại");

    const randomContent = `TX2026${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newTx: Transaction = {
      id: `DH-${Date.now()}`,
      userId,
      type: TransactionType.DEPOSIT,
      amount,
      description: randomContent,
      status: TransactionStatus.PENDING,
      createdAt: new Date().toISOString(),
      metadata: {
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountName: bank.accountName,
        bankBin: bank.bankCode
      }
    };

    transactions.unshift(newTx);
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },

  buyKey: async (userId: string, productId: string, quantity: number, pricePerUnit: number, totalCost: number): Promise<GeneratedKey[]> => {
    await delay(600);
    const users: User[] = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    if (users[userIndex].balance < totalCost) throw new Error("Số dư không đủ!");

    // Deduct Balance
    users[userIndex].balance -= totalCost;
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));

    // Generate Keys
    const newKeys: GeneratedKey[] = [];
    const savedKeys: GeneratedKey[] = JSON.parse(localStorage.getItem(LS_KEYS.KEYS) || '[]');

    for(let i = 0; i < quantity; i++) {
        const keyString = `KEY-${productId.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const k: GeneratedKey = {
            id: `k-${Date.now()}-${i}`,
            keyString,
            userId,
            productName: productId,
            purchaseDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 86400000).toISOString() // Mock expiry
        };
        newKeys.push(k);
        savedKeys.push(k);
    }
    localStorage.setItem(LS_KEYS.KEYS, JSON.stringify(savedKeys));

    // Create History Record
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(LS_KEYS.TRANSACTIONS) || '[]');
    const newTx: Transaction = {
        id: `ORDER-${Date.now()}`,
        userId,
        type: TransactionType.BUY_KEY,
        amount: totalCost,
        description: `Mua ${quantity} key loại ${productId}`,
        status: TransactionStatus.SUCCESS,
        createdAt: new Date().toISOString(),
        metadata: {
            keys: newKeys.map(k => ({ code: k.keyString, expiry: k.expiryDate }))
        }
    };
    transactions.unshift(newTx);
    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));

    return newKeys;
  },

  getTransactions: (userId: string): Transaction[] => {
    const all = JSON.parse(localStorage.getItem(LS_KEYS.TRANSACTIONS) || '[]');
    return all.filter((t: Transaction) => t.userId === userId);
  },

  // --- ADMIN ---
  adminGetTransactions: (): Transaction[] => {
    return JSON.parse(localStorage.getItem(LS_KEYS.TRANSACTIONS) || '[]');
  },

  adminApproveDeposit: async (txId: string): Promise<void> => {
    const transactions: Transaction[] = JSON.parse(localStorage.getItem(LS_KEYS.TRANSACTIONS) || '[]');
    const txIndex = transactions.findIndex(t => t.id === txId);
    
    if (txIndex === -1) throw new Error("Transaction not found");
    if (transactions[txIndex].status !== TransactionStatus.PENDING) return; // Already processed

    const tx = transactions[txIndex];
    tx.status = TransactionStatus.SUCCESS;
    
    // Add Balance to User
    const users: User[] = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === tx.userId);
    if(userIndex !== -1) {
        users[userIndex].balance += tx.amount;
        localStorage.setItem(LS_KEYS.USERS, JSON.stringify(users));
        
        // Update current user if it's the admin viewing (edge case) or if we are refreshing somewhere
        const current = JSON.parse(localStorage.getItem(LS_KEYS.CURRENT_USER) || '{}');
        if(current.id === users[userIndex].id) {
            localStorage.setItem(LS_KEYS.CURRENT_USER, JSON.stringify(users[userIndex]));
        }
    }

    localStorage.setItem(LS_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  adminGetBanks: (): BankAccount[] => {
    return JSON.parse(localStorage.getItem(LS_KEYS.ADMIN_BANKS) || '[]');
  },

  adminAddBank: (bank: Omit<BankAccount, 'id'>) => {
    const banks = storageService.adminGetBanks();
    const newBank = { ...bank, id: `bank-${Date.now()}` };
    banks.push(newBank);
    localStorage.setItem(LS_KEYS.ADMIN_BANKS, JSON.stringify(banks));
  },
  
  adminRemoveBank: (id: string) => {
      const banks = storageService.adminGetBanks().filter(b => b.id !== id);
      localStorage.setItem(LS_KEYS.ADMIN_BANKS, JSON.stringify(banks));
  }
};