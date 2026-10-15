
import { Component, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';

import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';

@Component({
  selector: 'app-transaction-list',
  imports: [
    DatePipe,
    DecimalPipe,
    PaginatorModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.css'
})
export class TransactionListComponent {
  protected transactions = inject(TransactionService);
  protected accounts = inject(AccountService);
}
