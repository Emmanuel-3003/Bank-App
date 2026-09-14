package com.application.bank.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String trxnId;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @Column(name = "transfer_amount")
    private BigDecimal amount;

    private LocalDateTime transactionTime;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    private BigDecimal balanceAfterTransaction;

    @Size(min = 5, max = 200)
    private String trxnNote;

}