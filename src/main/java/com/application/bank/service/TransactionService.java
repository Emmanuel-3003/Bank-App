package com.application.bank.service;

import com.application.bank.payload.TransactionDTO;

public interface TransactionService {

    String deposit(String accountNumber, TransactionDTO transactionDTO);
}
