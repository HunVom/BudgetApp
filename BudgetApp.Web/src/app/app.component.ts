import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

import { AccountService } from './accounts/account.service';
import { TransactionService } from './transactions/transaction.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe, DecimalPipe, PaginatorModule],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  protected accounts = inject(AccountService);
  protected transactions = inject(TransactionService);

  ngOnInit() {
    this.accounts.loadAccounts();
    this.accounts.loadAllAccounts();

    this.transactions.loadBalance();
    this.transactions.loadTransactions();
    this.transactions.loadTransactionsCount();
  }

  protected deleteAccount(id: number) {           
    this.accounts.deleteAccount(id, () => {
      this.transactions.clearDeletedAccount(id);
    });
  }

  // A számlatörlés az AccountService feladata, de sikeres törlés után
  // a TransactionService-ben is törölni kell a kiválasztott számlát.
  // A deleteAccount() metódus csak a két service működését hangolja össze,
  // üzleti logikát nem tartalmaz.
}