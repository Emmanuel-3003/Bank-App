package com.application.bank.service;

import com.application.bank.payload.TransactionDTO;

public interface TransactionService {

    TransactionDTO deposit(String accountNumber, TransactionDTO transactionDTO);
    TransactionDTO withdraw(String accountNumber, TransactionDTO transactionDTO);
}
