import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  type = 'income';
  amount: number | null = null;
  date = '';
  balance = 0;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadBalance();
  }

  save() {
    const transaction = {
      type: this.type === 'income' ? 0 : 1,
      amount: this.amount,
      date: this.date
    };

    this.http.post('http://localhost:5093/transactions', transaction)
      .subscribe(response => {
        console.log('Backend válasza:', response);
        this.loadBalance();
      });
  }

  loadBalance() {
    this.http.get<number>('http://localhost:5093/transactions/balance')
      .subscribe(response => {
        this.balance = response;
      });
  }
}
