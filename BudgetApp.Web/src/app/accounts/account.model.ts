export interface Account {
  id: number;
  name: string;
  isDeleted: boolean;
  type: number;
  targetAmount: number | null;
  targetDate: string | null;
  initialDebt: number;
  balance?: number;
  remainingDebt?: number;
}
