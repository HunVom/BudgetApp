
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Account } from './account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  accountState = {
    name: signal(''),
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
          this.http.get<number>(`http://localhost:5093/transactions/balance/${account.id}`)
            .subscribe(balance => {
              account.balance = balance;
              this.accountState.accounts.set([...accounts]);
            });
        }
      });
  }

  loadAllAccounts() {
    this.http.get<Account[]>('http://localhost:5093/accounts/all')
      .subscribe(accounts => this.accountState.allAccounts.set(accounts));
  }

  // Létrehozás

  createAccount() {
    const account = {
      name: this.accountState.name()
    };

    this.http.post('http://localhost:5093/accounts', account)
      .subscribe(() => {
        this.accountState.name.set('');
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

    this.http.put(`http://localhost:5093/accounts/${id}`, { name })
      .subscribe(() => {
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
}
