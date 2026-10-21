package com.application.bank.payload;

import com.application.bank.model.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
    @NotNull(message = "Transaction amount is required")
    @DecimalMin(
            value = "0.0",
            inclusive = false,
            message = "Transaction amount must be greater than zero"
    )
    private BigDecimal amount;
    private String trxnNote;
    private TransactionType transactionType;
    private LocalDateTime transactionTime;
    private BigDecimal balanceAfterTransaction;
}
