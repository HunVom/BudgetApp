
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';

@Component({
  selector: 'app-transaction-form',
  imports: [
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})

export class TransactionFormComponent {
  protected transactions = inject(TransactionService);
  protected accounts = inject(AccountService);

  getAvailableAccounts() {
    const type = this.transactions.form.type();
    const accounts = this.accounts.accountState.accounts();

    if (type === 'debtCharge')
      return accounts.filter(account => account.type === 2);

    if (type === 'transfer')
      return accounts;

    return accounts.filter(account => account.type !== 2);
  }
}
