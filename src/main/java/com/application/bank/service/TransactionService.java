package com.application.bank.service;

import com.application.bank.payload.TransactionDTO;
import com.application.bank.payload.TransferRequestDTO;
import com.application.bank.payload.TransferResponseDTO;

public interface TransactionService {

    TransactionDTO deposit(String accountNumber, TransactionDTO transactionDTO);
    TransactionDTO withdraw(String accountNumber, TransactionDTO transactionDTO);
    TransferResponseDTO transfer(TransferRequestDTO transferRequestDTO);
}
