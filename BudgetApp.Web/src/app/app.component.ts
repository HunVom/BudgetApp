import { Component, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected type = signal<string>("income");
  protected amount = signal<number>(0);
  protected date = signal<string>("");
  protected balance = signal<number>(0);
  public id = input.required<number>();

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getTransactionDetails(this.id()).subscribe
    this.loadBalance();
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
      });
  }

  private getTransactionDetails(id: number) {
    this.http.get("http://localhost:5093/transaction/" + id).subscribe
  }

  private loadBalance() {
    this.http.get<number>('http://localhost:5093/transactions/balance')
      .subscribe(response => {
        this.balance.set(response);
      });
  }
}
