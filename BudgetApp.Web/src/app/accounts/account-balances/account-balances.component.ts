
import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { AccountService } from '../account.service';
import { TransactionService } from '../../transactions/transaction.service';

@Component({
  selector: 'app-account-balances',
  imports: [DecimalPipe],
  templateUrl: './account-balances.component.html',
  styleUrl: './account-balances.component.css'
})
export class AccountBalancesComponent {
  protected accounts = inject(AccountService);
  protected transactions = inject(TransactionService);
}
