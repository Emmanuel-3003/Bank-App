package com.application.bank.service;

import com.application.bank.payload.StatementResponse;
import com.application.bank.payload.TransactionDTO;
import com.application.bank.payload.TransferRequestDTO;
import com.application.bank.payload.TransferResponseDTO;

import java.time.LocalDate;

public interface TransactionService {

    TransactionDTO deposit(String accountNumber, TransactionDTO transactionDTO);
    TransactionDTO withdraw(String accountNumber, TransactionDTO transactionDTO);
    TransferResponseDTO transfer(TransferRequestDTO transferRequestDTO);
    StatementResponse getAccountStatement(String accountNumber, LocalDate fromDate, LocalDate toDate, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
}
