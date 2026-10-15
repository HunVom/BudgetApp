import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { TransactionService } from './transactions/transaction.service';
import { TransactionFormComponent } from './transactions/transaction-form/transaction-form.component';
import { TransactionFiltersComponent } from './transactions/transaction-filters/transaction-filters.component';
import { TransactionListComponent } from './transactions/transaction-list/transaction-list.component';
import { TransactionEditComponent } from './transactions/transaction-edit/transaction-edit.component';
import { AccountService } from './accounts/account.service';
import { AccountManagementComponent } from './accounts/account-management/account-management.component';
import { AccountBalancesComponent } from './accounts/account-balances/account-balances.component';

@Component({
  selector: 'app-root',
  imports: [
    TransactionFormComponent,
    TransactionFiltersComponent,
    TransactionListComponent,
    TransactionEditComponent,
    AccountBalancesComponent,
    AccountManagementComponent
  ],
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
}
