import { Component, OnInit, signal } from '@angular/core';
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
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected type = signal<string>('income');
  protected amount = signal<number>(0);
  protected date = signal<string>(this.today());
  protected balance = signal<number>(0);
  protected transactions = signal<Transaction[]>([]);
  protected note = signal<string>('');
  protected editPanelOpen = signal<boolean>(false);
  protected selectedTransaction = signal<Transaction | null>(null);
  protected editType = signal<string>('income');
  protected editAmount = signal<number>(0);
  protected editDate = signal<string>('');
  protected editNote = signal<string>('');

  protected accountName = signal<string>('');
  protected accounts = signal<Account[]>([]);
  protected accountId = signal<number>(0);
  protected editAccountId = signal<number>(0);

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadBalance();
    this.loadTransactions();
    this.loadAccounts();
  }

  protected save() {
    const transaction = {
      type: this.type() === 'income' ? 0 : 1,
      amount: this.amount(),
      date: this.date(),
      note: this.note(),
      accountId: this.accountId()
    };

    this.http.post('http://localhost:5093/transactions', transaction)
      .subscribe(response => {
        console.log('Backend válasza:', response);

        this.loadBalance();
        this.loadTransactions();
        this.loadAccounts();

        this.amount.set(0);
        this.date.set(this.today());
        this.note.set('');
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
  const transaction = this.selectedTransaction();

  if (!transaction)
    return;

  const updatedTransaction = {
    type: this.editType() === 'income' ? 0 : 1,
    amount: this.editAmount(),
    date: this.editDate(),
    note: this.editNote(),

    accountId: this.editAccountId()
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
    this.selectedTransaction.set(transaction);

    this.editType.set(transaction.type === 0 ? 'income' : 'expense');
    this.editAmount.set(transaction.amount);
    this.editDate.set(transaction.date.substring(0, 10)); // Extract the date part from the datetime string
    this.editNote.set(transaction.note);

    this.editAccountId.set(transaction.accountId);

    this.editPanelOpen.set(true);
  }

    protected closeEditPanel() {
    this.selectedTransaction.set(null);  
    this.editPanelOpen.set(false);
  }

  private loadBalance() {
    this.http.get<number>('http://localhost:5093/transactions/balance')
      .subscribe(response => {
        this.balance.set(response);
      });
  }

  private loadTransactions() {
    this.http.get<Transaction[]>('http://localhost:5093/transactions')
      .subscribe(response => {
        this.transactions.set(response);
      });
  }

  protected createAccount() {
    const account = {
      name: this.accountName()
    };

  this.http.post('http://localhost:5093/accounts', account)
    .subscribe(() => {
      this.accountName.set('');
      this.loadAccounts();
    });
  }

  private loadAccounts() {
  this.http.get<Account[]>('http://localhost:5093/accounts')
    .subscribe(accounts => {
      this.accounts.set(accounts);

      for (const account of accounts) {
        this.http.get<number>(`http://localhost:5093/transactions/balance/${account.id}`)
          .subscribe(balance => {
            account.balance = balance;
            this.accounts.set([...accounts]);
          });
      }
    });
  }

  protected getAccountName(accountId: number) {
    const account = this.accounts().find(account => account.id === accountId);
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