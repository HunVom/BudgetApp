export interface Transaction {
  id: number;
  type: number;
  amount: number;
  date: string;
  note: string;
  accountId: number;
}