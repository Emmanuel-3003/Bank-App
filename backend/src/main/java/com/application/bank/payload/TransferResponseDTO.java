package com.application.bank.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransferResponseDTO {
    private String trxnId;
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private BigDecimal fromAccountBalance;
    private BigDecimal toAccountBalance;
    private LocalDateTime transactionTime;
    private String trxnNote;
}