import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';

interface Transaction {
  id: number;
  type: number;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected type = signal<string>("income");
  protected amount = signal<number>(0);
  protected date = signal<string>(this.today());
  protected balance = signal<number>(0);
  protected transactions = signal<Transaction[]>([]);
  
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadBalance();
    this.loadTransactions();
  }

  protected save() {
    const transaction = {
      type: this.type() === 'income' ? 0 : 1,
      amount: this.amount(),
      date: this.date()
    };

    this.http.post('http://localhost:5093/transactions', transaction)
      .subscribe(response => {
        console.log('Backend válasza:', response);
        this.loadBalance();
        this.loadTransactions();

        this.amount.set(0);
        this.date.set(this.today());
      });
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

  private today() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
  }
}
