
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
  selector: 'app-transaction-edit',
  imports: [
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    ButtonModule
  ],
  templateUrl: './transaction-edit.component.html',
  styleUrl: './transaction-edit.component.css'
})
export class TransactionEditComponent {
  protected transactions = inject(TransactionService);
  protected accounts = inject(AccountService);
}
