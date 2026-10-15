
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Account } from './account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
    
  accountState = {
    name: signal(''),
    type: signal(0),
    targetAmount: signal<number | null>(null),
    targetDate: signal<string | null>(null),
    initialDebt: signal<number | null>(null),

    accounts: signal<Account[]>([]),
    allAccounts: signal<Account[]>([]),
    editingId: signal<number | null>(null),
    editingName: signal('')
  };

  constructor(private http: HttpClient) {}

  // Betöltés

  loadAccounts() {
    this.http.get<Account[]>('http://localhost:5093/accounts')
      .subscribe(accounts => {
        this.accountState.accounts.set(accounts);

        for (const account of accounts) {
          if (account.type === 2) {
            this.http.get<number>(
              `http://localhost:5093/accounts/${account.id}/debt`
            ).subscribe(debt => {
              account.remainingDebt = debt;
              this.accountState.accounts.set([...accounts]);
            });
          } else {
            this.http.get<number>(
              `http://localhost:5093/transactions/balance/${account.id}`
            ).subscribe(balance => {
              account.balance = balance;
              this.accountState.accounts.set([...accounts]);
            });
          }
        }
      });
  }

  loadAllAccounts() {
    this.http.get<Account[]>('http://localhost:5093/accounts/all')
      .subscribe(accounts => this.accountState.allAccounts.set(accounts));
  }

  // Létrehozás
  
  createAccount() {
    const state = this.accountState;
    const name = state.name().trim();

    if (!name) return;

    const account = {
      name,
      type: state.type(),
      targetAmount: state.type() === 1 ? state.targetAmount() : null,
      targetDate: state.type() === 1 ? state.targetDate() : null,
      initialDebt: state.type() === 2 ? (state.initialDebt() ?? 0) : 0
    };

    this.http.post('http://localhost:5093/accounts', account)
      .subscribe(() => {
        state.name.set('');
        state.type.set(0);
        state.targetAmount.set(null);
        state.targetDate.set(null);
        state.initialDebt.set(null);

        this.loadAccounts();
        this.loadAllAccounts();
      });
  }

  // Szerkesztés

  startAccountEdit(account: Account) {
    this.accountState.editingId.set(account.id);
    this.accountState.editingName.set(account.name);
  }

  cancelAccountEdit() {
    this.accountState.editingId.set(null);
    this.accountState.editingName.set('');
  }
  
  saveAccountEdit() {
    const id = this.accountState.editingId();
    const name = this.accountState.editingName().trim();

    if (id === null || !name) return;

    const account = this.accountState.accounts()
      .find(a => a.id === id);

    if (!account) return;

    this.http.put(`http://localhost:5093/accounts/${id}`, {
      name,
      type: account.type,
      targetAmount: account.targetAmount,
      targetDate: account.targetDate,
      initialDebt: account.initialDebt
    }).subscribe(() => {
      this.loadAccounts();
      this.loadAllAccounts();
      this.cancelAccountEdit();
    });
  }

  // Törlés

  deleteAccount(id: number, onDeleted?: () => void) {
    this.http.delete(`http://localhost:5093/accounts/${id}`, {
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.loadAccounts();
        this.loadAllAccounts();
        onDeleted?.();
      },
      error: (err) => {
        alert(err.error || 'Nem sikerült törölni a számlát.');
      }
    });
  }

  // Segédfüggvények

  getAccountName(accountId: number) {
    const account = this.accountState.allAccounts()
      .find(account => account.id === accountId);

    return account?.name ?? 'Nincs számla';
  }

  getAvailableAccounts(type: string): Account[] {
  const accounts = this.accountState.accounts();

  if (type === 'debtCharge')
    return accounts.filter(account => account.type === 2);

  if (type === 'transfer')
    return accounts;

  return accounts.filter(account => account.type !== 2);
  }
}
