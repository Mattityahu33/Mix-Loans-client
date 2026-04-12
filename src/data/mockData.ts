export type InterestType = 'Weekly' | 'Monthly';
export type LoanStatus = 'Active' | 'Due Soon' | 'Overdue' | 'Completed' | 'Defaulted';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type CollateralStatus = 'Held' | 'Returned' | 'Forfeited' | 'Sold';

export interface Client {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  address: string;
  riskLevel: RiskLevel;
  notes: string;
}

export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  interestType: InterestType;
  totalRepayment: number;
  totalInterest: number;
  remainingBalance: number;
  startDate: string;
  dueDate: string;
  gracePeriodEndDate: string;
  status: LoanStatus;
  collateralDescription: string;
  collateralValue: number;
  notes: string;
  duration: number; // weeks or months
  gracePeriod: number; // days
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  remainingBalance: number;
  notes: string;
}

export interface Collateral {
  id: string;
  loanId: string;
  clientName: string;
  description: string;
  estimatedValue: number;
  loanStatus: LoanStatus;
  collateralStatus: CollateralStatus;
}

export interface Settings {
  defaultInterestRate: number;
  defaultInterestType: InterestType;
  defaultGracePeriod: number;
  dueSoonWarningPeriod: number;
  totalCapitalAvailable: number;
}

// Mock clients data
export const mockClients: Client[] = [
  {
    id: 'C001',
    name: 'Sarah Johnson',
    phone: '+260 977 123 456',
    idNumber: 'NRC 123456/78/1',
    address: '123 Main Street, Lusaka',
    riskLevel: 'Low',
    notes: 'Reliable borrower, always pays on time'
  },
  {
    id: 'C002',
    name: 'Michael Banda',
    phone: '+260 966 234 567',
    idNumber: 'NRC 234567/89/1',
    address: '45 Independence Avenue, Kitwe',
    riskLevel: 'Medium',
    notes: 'Good payment history, occasional delays'
  },
  {
    id: 'C003',
    name: 'Grace Mwansa',
    phone: '+260 955 345 678',
    idNumber: 'NRC 345678/90/1',
    address: '78 Church Road, Ndola',
    riskLevel: 'Low',
    notes: 'New client, no history yet'
  },
  {
    id: 'C004',
    name: 'John Phiri',
    phone: '+260 977 456 789',
    idNumber: 'NRC 456789/01/1',
    address: '12 Freedom Way, Livingstone',
    riskLevel: 'High',
    notes: 'Has missed payments before, monitor closely'
  },
  {
    id: 'C005',
    name: 'Patricia Zulu',
    phone: '+260 966 567 890',
    idNumber: 'NRC 567890/12/1',
    address: '90 Unity Street, Kabwe',
    riskLevel: 'Low',
    notes: 'Excellent credit record'
  },
  {
    id: 'C006',
    name: 'David Tembo',
    phone: '+260 955 678 901',
    idNumber: 'NRC 678901/23/1',
    address: '34 Market Road, Chingola',
    riskLevel: 'Medium',
    notes: 'Self-employed, variable income'
  },
  {
    id: 'C007',
    name: 'Elizabeth Sakala',
    phone: '+260 977 789 012',
    idNumber: 'NRC 789012/34/1',
    address: '56 Station Road, Solwezi',
    riskLevel: 'Low',
    notes: 'Regular business client'
  },
  {
    id: 'C008',
    name: 'James Mulenga',
    phone: '+260 966 890 123',
    idNumber: 'NRC 890123/45/1',
    address: '23 Hospital Lane, Kasama',
    riskLevel: 'High',
    notes: 'Previous default, second chance loan'
  }
];

// Mock loans data
export const mockLoans: Loan[] = [
  {
    id: 'L001',
    clientId: 'C001',
    clientName: 'Sarah Johnson',
    amount: 50000,
    interestRate: 15,
    interestType: 'Monthly',
    totalRepayment: 57500,
    totalInterest: 7500,
    remainingBalance: 28750,
    startDate: '2025-11-15',
    dueDate: '2026-02-15',
    gracePeriodEndDate: '2026-02-22',
    status: 'Active',
    collateralDescription: 'Television - Samsung 55" Smart TV',
    collateralValue: 65000,
    notes: 'Business expansion loan',
    duration: 3,
    gracePeriod: 7
  },
  {
    id: 'L002',
    clientId: 'C002',
    clientName: 'Michael Banda',
    amount: 30000,
    interestRate: 10,
    interestType: 'Weekly',
    totalRepayment: 33000,
    totalInterest: 3000,
    remainingBalance: 8250,
    startDate: '2026-01-05',
    dueDate: '2026-02-16',
    gracePeriodEndDate: '2026-02-21',
    status: 'Due Soon',
    collateralDescription: 'Laptop - Dell Inspiron',
    collateralValue: 45000,
    notes: 'Personal emergency loan',
    duration: 6,
    gracePeriod: 5
  },
  {
    id: 'L003',
    clientId: 'C004',
    clientName: 'John Phiri',
    amount: 25000,
    interestRate: 20,
    interestType: 'Monthly',
    totalRepayment: 30000,
    totalInterest: 5000,
    remainingBalance: 30000,
    startDate: '2025-12-15',
    dueDate: '2026-01-15',
    gracePeriodEndDate: '2026-01-25',
    status: 'Overdue',
    collateralDescription: 'Refrigerator - LG 400L',
    collateralValue: 35000,
    notes: 'Client is having payment difficulties',
    duration: 1,
    gracePeriod: 10
  },
  {
    id: 'L004',
    clientId: 'C005',
    clientName: 'Patricia Zulu',
    amount: 75000,
    interestRate: 12,
    interestType: 'Monthly',
    totalRepayment: 84000,
    totalInterest: 9000,
    remainingBalance: 0,
    startDate: '2025-08-01',
    dueDate: '2025-11-01',
    gracePeriodEndDate: '2025-11-08',
    status: 'Completed',
    collateralDescription: 'Motorcycle - Honda 125cc',
    collateralValue: 95000,
    notes: 'Paid in full ahead of schedule',
    duration: 3,
    gracePeriod: 7
  },
  {
    id: 'L005',
    clientId: 'C003',
    clientName: 'Grace Mwansa',
    amount: 40000,
    interestRate: 15,
    interestType: 'Monthly',
    totalRepayment: 46000,
    totalInterest: 6000,
    remainingBalance: 34500,
    startDate: '2025-12-01',
    dueDate: '2026-03-01',
    gracePeriodEndDate: '2026-03-08',
    status: 'Active',
    collateralDescription: 'Sound System - Sony Home Theater',
    collateralValue: 55000,
    notes: 'First-time borrower',
    duration: 3,
    gracePeriod: 7
  },
  {
    id: 'L006',
    clientId: 'C006',
    clientName: 'David Tembo',
    amount: 20000,
    interestRate: 18,
    interestType: 'Weekly',
    totalRepayment: 23600,
    totalInterest: 3600,
    remainingBalance: 15600,
    startDate: '2026-01-12',
    dueDate: '2026-02-16',
    gracePeriodEndDate: '2026-02-23',
    status: 'Due Soon',
    collateralDescription: 'Generator - 5KVA',
    collateralValue: 32000,
    notes: 'Small business inventory loan',
    duration: 5,
    gracePeriod: 7
  },
  {
    id: 'L007',
    clientId: 'C008',
    clientName: 'James Mulenga',
    amount: 15000,
    interestRate: 25,
    interestType: 'Monthly',
    totalRepayment: 18750,
    totalInterest: 3750,
    remainingBalance: 18750,
    startDate: '2025-10-01',
    dueDate: '2025-11-01',
    gracePeriodEndDate: '2025-11-11',
    status: 'Defaulted',
    collateralDescription: 'Mobile Phone - iPhone 12',
    collateralValue: 20000,
    notes: 'Client unresponsive, initiating collateral process',
    duration: 1,
    gracePeriod: 10
  },
  {
    id: 'L008',
    clientId: 'C007',
    clientName: 'Elizabeth Sakala',
    amount: 60000,
    interestRate: 14,
    interestType: 'Monthly',
    totalRepayment: 68400,
    totalInterest: 8400,
    remainingBalance: 0,
    startDate: '2025-07-15',
    dueDate: '2025-10-15',
    gracePeriodEndDate: '2025-10-22',
    status: 'Completed',
    collateralDescription: 'Washing Machine - Bosch',
    collateralValue: 75000,
    notes: 'Repeat customer, excellent record',
    duration: 3,
    gracePeriod: 7
  },
  {
    id: 'L009',
    clientId: 'C001',
    clientName: 'Sarah Johnson',
    amount: 35000,
    interestRate: 15,
    interestType: 'Monthly',
    totalRepayment: 40250,
    totalInterest: 5250,
    remainingBalance: 30000,
    startDate: '2026-01-20',
    dueDate: '2026-03-20',
    gracePeriodEndDate: '2026-03-27',
    status: 'Active',
    collateralDescription: 'Tablet - iPad Air',
    collateralValue: 48000,
    notes: 'Second active loan for this client',
    duration: 2,
    gracePeriod: 7
  },
  {
    id: 'L010',
    clientId: 'C002',
    clientName: 'Michael Banda',
    amount: 45000,
    interestRate: 16,
    interestType: 'Monthly',
    totalRepayment: 52200,
    totalInterest: 7200,
    remainingBalance: 0,
    startDate: '2025-05-01',
    dueDate: '2025-08-01',
    gracePeriodEndDate: '2025-08-08',
    status: 'Completed',
    collateralDescription: 'Microwave Oven - LG',
    collateralValue: 18000,
    notes: 'Previous loan, paid successfully',
    duration: 3,
    gracePeriod: 7
  }
];

// Mock payments data
export const mockPayments: Payment[] = [
  { id: 'P001', loanId: 'L001', amount: 28750, date: '2025-12-15', remainingBalance: 28750, notes: 'First payment' },
  { id: 'P002', loanId: 'L002', amount: 24750, date: '2026-01-20', remainingBalance: 8250, notes: 'Partial payment' },
  { id: 'P003', loanId: 'L004', amount: 84000, date: '2025-10-25', remainingBalance: 0, notes: 'Final payment - early settlement' },
  { id: 'P004', loanId: 'L005', amount: 11500, date: '2026-01-01', remainingBalance: 34500, notes: 'First installment' },
  { id: 'P005', loanId: 'L006', amount: 8000, date: '2026-01-26', remainingBalance: 15600, notes: 'Weekly payment' },
  { id: 'P006', loanId: 'L008', amount: 68400, date: '2025-10-10', remainingBalance: 0, notes: 'Full payment' },
  { id: 'P007', loanId: 'L009', amount: 10250, date: '2026-02-10', remainingBalance: 30000, notes: 'First payment' },
  { id: 'P008', loanId: 'L010', amount: 52200, date: '2025-07-28', remainingBalance: 0, notes: 'Complete repayment' },
  { id: 'P009', loanId: 'L001', amount: 0, date: '2026-01-15', remainingBalance: 28750, notes: 'No payment received yet' },
];

// Mock collateral data
export const mockCollateral: Collateral[] = mockLoans.map(loan => ({
  id: `COL-${loan.id}`,
  loanId: loan.id,
  clientName: loan.clientName,
  description: loan.collateralDescription,
  estimatedValue: loan.collateralValue,
  loanStatus: loan.status,
  collateralStatus: 
    loan.status === 'Completed' ? 'Returned' :
    loan.status === 'Defaulted' ? 'Forfeited' :
    'Held'
}));

// Mock settings
export const mockSettings: Settings = {
  defaultInterestRate: 15,
  defaultInterestType: 'Monthly',
  defaultGracePeriod: 7,
  dueSoonWarningPeriod: 7,
  totalCapitalAvailable: 500000
};
