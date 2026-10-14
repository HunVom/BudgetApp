
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    targetAccountId: signal<number | null>(null),
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
    targetAccountId: signal<number | null>(null),
    amountTouched: signal(false)
  };


  filters = {
    dateRange: signal<Date[] | null>(null),
    type: signal<number | null>(null),
    accountId: signal<number | null>(null)
    
  };


  transactionState = {
    balance: signal(0),
    transactions: signal<Transaction[]>([]),
    from: signal(0),
    to: signal(25),
    totalRecords: signal(0),
    accountId: signal<number | null>(null)
  };

  constructor(
    private http: HttpClient,
    private accounts: AccountService
  ) {}


  private filterParams() {
    let params = new HttpParams();

    const type = this.filters.type();
    const accountId = this.transactionState.accountId();

    if (type !== null)
      params = params.set('type', type);

    if (accountId !== null)
      params = params.set('accountId', accountId);

    const [dateFrom, dateTo] = this.filters.dateRange() ?? [];

    if (dateFrom)
      params = params.set('dateFrom', this.formatDate(dateFrom));

    if (dateTo || dateFrom)
      params = params.set('dateTo', this.formatDate(dateTo ?? dateFrom));

    return params;
  }


  applyFilters() {
    this.transactionState.from.set(0);
    this.transactionState.accountId.set(this.filters.accountId());
    this.loadTransactions();
    this.loadTransactionsCount();
  }

  clearFilters() {
    this.filters.dateRange.set(null);
    this.filters.type.set(null);
    this.filters.accountId.set(null);

    this.applyFilters();
  }

  // Betöltés

  loadBalance() {
    this.http.get<number>('http://localhost:5093/transactions/balance')
      .subscribe(balance => this.transactionState.balance.set(balance));
  }

  
  loadTransactions() {
    const params = this.filterParams()
      .set('from', this.transactionState.from())
      .set('to', this.transactionState.to());

    this.http.get<Transaction[]>(
      'http://localhost:5093/transactions',
      { params }
    ).subscribe(transactions =>
      this.transactionState.transactions.set(transactions)
    );
  }

  loadTransactionsCount() {
    this.http.get<number>(
      'http://localhost:5093/transactions/count',
      { params: this.filterParams() }
    ).subscribe(count =>
      this.transactionState.totalRecords.set(count)
    );
  }

  // Létrehozás

  save() {
    if (!Number.isFinite(this.form.amount()) || this.form.amount() < 0.01)
      return;

    if (this.form.type() === 'transfer' &&
    (!this.form.targetAccountId() ||
     this.form.accountId() === this.form.targetAccountId()))
    return;

    const transaction = {
      type: this.form.type() === 'income' ? 0
          : this.form.type() === 'expense' ? 1 : 2,
      amount: this.form.amount(),
      date: this.form.date(),
      note: this.form.note(),
      accountId: this.form.accountId(),
      targetAccountId: this.form.type() === 'transfer'
        ? this.form.targetAccountId()
        : null
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
        this.form.targetAccountId.set(null);
    });
  }

  // Szerkesztés

  openEditPanel(transaction: Transaction) {
    this.edit.selectedTransaction.set(transaction);
    this.edit.type.set(transaction.type === 0 ? 'income' : transaction.type === 1 ? 'expense' : 'transfer');
    this.edit.amount.set(transaction.amount);
    this.edit.amountTouched.set(false);
    this.edit.date.set(transaction.date.substring(0, 10));
    this.edit.note.set(transaction.note);
    this.edit.accountId.set(transaction.accountId);
    this.edit.targetAccountId.set(transaction.targetAccountId);
    this.edit.panelOpen.set(true);
  }

  closeEditPanel() {
    this.edit.selectedTransaction.set(null);
    this.edit.panelOpen.set(false);
  }

  saveEdit() {
    if (!Number.isFinite(this.edit.amount()) || this.edit.amount() < 0.01)
      return;

    if (this.edit.type() === 'transfer' &&
      (!this.edit.targetAccountId() ||
      this.edit.accountId() === this.edit.targetAccountId()))
      return;

    const transaction = this.edit.selectedTransaction();

    if (!transaction)
      return;

    const updatedTransaction = {
      type: this.edit.type() === 'income' ? 0
          : this.edit.type() === 'expense' ? 1 : 2,
      amount: this.edit.amount(),
      date: this.edit.date(),
      note: this.edit.note(),
      accountId: this.edit.accountId(),
      targetAccountId: this.edit.type() === 'transfer'
        ? this.edit.targetAccountId()
        : null
    };

    this.http.put(
      `http://localhost:5093/transactions/${transaction.id}`,
      updatedTransaction
    ).subscribe(() => {
      this.loadBalance();
      this.loadTransactions();
      this.loadTransactionsCount();
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

        const remaining = Math.max(0, this.transactionState.totalRecords() - 1);
        const from = this.transactionState.from();
        const to = this.transactionState.to();

        this.transactionState.totalRecords.set(remaining);

        if (from >= remaining && from > 0)
          this.transactionState.from.set(Math.max(0, from - to));

        this.loadTransactions();
        this.loadTransactionsCount();
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

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  parseDate(date: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

}
