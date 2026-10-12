
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../accounts/account.service';
import { Transaction } from './transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  // Állapotok

  form = {
    type: signal('income'),
    amount: signal(0),
    date: signal(this.today()),
    note: signal(''),
    accountId: signal(0),
    amountTouched: signal(false)
  };

  edit = {
    panelOpen: signal(false),
    selectedTransaction: signal<Transaction | null>(null),
    type: signal('income'),
    amount: signal(0),
    date: signal(''),
    note: signal(''),
    accountId: signal(0),
    amountTouched: signal(false)
  };

  transactionState = {
    balance: signal(0),
    transactions: signal<Transaction[]>([]),
    from: signal(0),
    to: signal(25),
    totalRecords: signal(0)
  };

  constructor(
    private http: HttpClient,
    private accounts: AccountService
  ) {}

  // Betöltés

  loadBalance() {
    this.http.get<number>('http://localhost:5093/transactions/balance')
      .subscribe(balance => this.transactionState.balance.set(balance));
  }

  loadTransactions() {
    const from = this.transactionState.from();
    const to = this.transactionState.to();

    this.http.get<Transaction[]>(
      `http://localhost:5093/transactions?from=${from}&to=${to}`
    ).subscribe(transactions =>
      this.transactionState.transactions.set(transactions)
    );
  }

  loadTransactionsCount() {
    this.http.get<number>('http://localhost:5093/transactions/count')
      .subscribe(count => this.transactionState.totalRecords.set(count));
  }

  // Létrehozás

  save() {
    if (!Number.isFinite(this.form.amount()) || this.form.amount() < 0.01)
      return;

    const transaction = {
      type: this.form.type() === 'income' ? 0 : 1,
      amount: this.form.amount(),
      date: this.form.date(),
      note: this.form.note(),
      accountId: this.form.accountId()
    };

    this.http.post('http://localhost:5093/transactions', transaction)
      .subscribe(() => {
        this.loadBalance();
        this.loadTransactions();
        this.loadTransactionsCount();
        this.accounts.loadAccounts();

        this.form.amount.set(0);
        this.form.amountTouched.set(false);
        this.form.date.set(this.today());
        this.form.note.set('');
      });
  }

  // Szerkesztés

  openEditPanel(transaction: Transaction) {
    this.edit.selectedTransaction.set(transaction);
    this.edit.type.set(transaction.type === 0 ? 'income' : 'expense');
    this.edit.amount.set(transaction.amount);
    this.edit.amountTouched.set(false);
    this.edit.date.set(transaction.date.substring(0, 10));
    this.edit.note.set(transaction.note);
    this.edit.accountId.set(transaction.accountId);
    this.edit.panelOpen.set(true);
  }

  closeEditPanel() {
    this.edit.selectedTransaction.set(null);
    this.edit.panelOpen.set(false);
  }

  saveEdit() {
    if (!Number.isFinite(this.edit.amount()) || this.edit.amount() < 0.01)
      return;

    const transaction = this.edit.selectedTransaction();

    if (!transaction)
      return;

    const updatedTransaction = {
      type: this.edit.type() === 'income' ? 0 : 1,
      amount: this.edit.amount(),
      date: this.edit.date(),
      note: this.edit.note(),
      accountId: this.edit.accountId()
    };

    this.http.put(
      `http://localhost:5093/transactions/${transaction.id}`,
      updatedTransaction
    ).subscribe(() => {
      this.loadBalance();
      this.loadTransactions();
      this.accounts.loadAccounts();
      this.closeEditPanel();
    });
  }

  // Törlés

  deleteTransaction(id: number) {
    this.http.delete(`http://localhost:5093/transactions/${id}`)
      .subscribe(() => {
        this.loadBalance();
        this.accounts.loadAccounts();

        const remaining = this.transactionState.totalRecords() - 1;
        const from = this.transactionState.from();
        const to = this.transactionState.to();

        this.transactionState.totalRecords.set(remaining);

        if (from >= remaining && from > 0)
          this.transactionState.from.set(Math.max(0, from - to));

        this.loadTransactions();
      });
  }

  clearDeletedAccount(id: number) {
    if (this.form.accountId() === id)
        this.form.accountId.set(0);

    if (this.edit.accountId() === id)
        this.edit.accountId.set(0);
    }

  // Lapozás

  changePage(from: number, to: number) {
    this.transactionState.from.set(from);
    this.transactionState.to.set(to);
    this.loadTransactions();
  }

  // Segédfüggvények

  private today() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
