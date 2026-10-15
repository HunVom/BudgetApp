
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AccountService } from '../account.service';
import { TransactionService } from '../../transactions/transaction.service';

@Component({
  selector: 'app-account-management',
  imports: [FormsModule],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.css'
})
export class AccountManagementComponent {
  protected accounts = inject(AccountService);
  protected transactions = inject(TransactionService);

  deleteAccount(id: number) {
    this.accounts.deleteAccount(id, () => {
      this.transactions.clearDeletedAccount(id);
    });
  }
}
