import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';

@Component({
  selector: 'app-transaction-filters',
  imports: [
    FormsModule,
    DatePickerModule,
    RadioButtonModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './transaction-filters.component.html'
})
export class TransactionFiltersComponent {
  protected transactions = inject(TransactionService);
  protected accounts = inject(AccountService);
}