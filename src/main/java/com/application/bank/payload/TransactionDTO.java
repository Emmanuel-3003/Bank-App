package com.application.bank.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionDTO {

    private Long id;
    private String trxnId;
    private String accountNumber;
    private BigDecimal amount;
    private String trxnNote;
}
