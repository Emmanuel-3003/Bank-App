package com.application.bank.payload;

import com.application.bank.model.AccountStatus;
import com.application.bank.model.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AccountDTO {
    private Long id;
    private String accountNumber;
    private String accountName;
    private LocalDate dateOfOpening;
    private AccountType accountType;      // client sends this
    private AccountStatus accountStatus;  // server sets this, client shouldn't send it
    private BigDecimal balance;
    private Long customerId;              // which customer owns it
}
