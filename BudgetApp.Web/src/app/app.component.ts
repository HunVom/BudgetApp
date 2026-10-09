import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';

interface Transaction {
  id: number;
  type: number;
  amount: number;
  date: string;
  note: string;
  accountId: number;
}

interface Account {
  id: number;
  name: string;
  balance?: number;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  
  protected form = {
  type: signal('income'),
  amount: signal(0),
  date: signal(this.today()),
  note: signal(''),
  accountId: signal(0)
};

protected edit = {
  panelOpen: signal(false),
  selectedTransaction: signal<Transaction | null>(null),
  type: signal('income'),
  amount: signal(0),
  date: signal(''),
  note: signal(''),
  accountId: signal(0)
};

protected account = {
  name: signal(''),
  accounts: signal<Account[]>([])
};

 protected transactionState = {
  balance: signal(0),
  transactions: signal<Transaction[]>([])
};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadBalance();
    this.loadTransactions();
    this.loadAccounts();
  }

  protected save() {
    const transaction = {
      type: this.form.type() === 'income' ? 0 : 1,
      amount: this.form.amount(),
      date: this.form.date(),
      note: this.form.note(),
      accountId: this.form.accountId()
    };

    this.http.post('http://localhost:5093/transactions', transaction)
      .subscribe(response => {
        console.log('Backend válasza:', response);

        this.loadBalance();
        this.loadTransactions();
        this.loadAccounts();

        this.form.amount.set(0);
        this.form.date.set(this.today());
        this.form.note.set('');
      });
  }

  protected deleteTransaction(id: number) {
    this.http.delete(`http://localhost:5093/transactions/${id}`)
      .subscribe(() => {
        this.loadBalance();
        this.loadTransactions();
        this.loadAccounts();
      });
  }

  protected saveEdit() {
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

  this.http.put(`http://localhost:5093/transactions/${transaction.id}`, updatedTransaction)
    .subscribe(() => {
      this.loadBalance();
      this.loadTransactions();
      this.loadAccounts();
      this.closeEditPanel();
    });
}

  protected openEditPanel(transaction: Transaction) {
    this.edit.selectedTransaction.set(transaction);

    this.edit.type.set(transaction.type === 0 ? 'income' : 'expense');
    this.edit.amount.set(transaction.amount);
    this.edit.date.set(transaction.date.substring(0, 10)); // Extract the date part from the datetime string
    this.edit.note.set(transaction.note);

    this.edit.accountId.set(transaction.accountId);

    this.edit.panelOpen.set(true);
  }

    protected closeEditPanel() {
    this.edit.selectedTransaction.set(null);  
    this.edit.panelOpen.set(false);
  }

  private loadBalance() {
    this.http.get<number>('http://localhost:5093/transactions/balance')
      .subscribe(response => {
        this.transactionState.balance.set(response);
      });
  }

  private loadTransactions() {
    this.http.get<Transaction[]>('http://localhost:5093/transactions')
      .subscribe(response => {
        this.transactionState.transactions.set(response);
      });
  }

  protected createAccount() {
    const account = {
      name: this.account.name()
    };

  this.http.post('http://localhost:5093/accounts', account)
    .subscribe(() => {
      this.account.name.set('');
      this.loadAccounts();
    });
  }

  private loadAccounts() {
  this.http.get<Account[]>('http://localhost:5093/accounts')
    .subscribe(accounts => {
      this.account.accounts.set(accounts);

      for (const account of accounts) {
        this.http.get<number>(`http://localhost:5093/transactions/balance/${account.id}`)
          .subscribe(balance => {
            account.balance = balance;
            this.account.accounts.set([...accounts]);
          });
      }
    });
  }

  protected getAccountName(accountId: number) {
    const account = this.account.accounts().find(account => account.id === accountId);
    return account?.name ?? 'Nincs számla';
  }

  private today() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}