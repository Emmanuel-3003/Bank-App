package com.application.bank.payload;

import com.application.bank.model.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDTO {

    private Long id;
    private String trxnId;
    private String accountNumber;
    private BigDecimal amount;
    private String trxnNote;
    private TransactionType transactionType;
    private LocalDateTime transactionTime;
    private BigDecimal balanceAfterTransaction;
}
