package com.application.bank.service;

import com.application.bank.exceptions.APIException;
import com.application.bank.exceptions.ResourceNotFoundException;
import com.application.bank.model.Account;
import com.application.bank.model.AccountStatus;
import com.application.bank.model.Transaction;
import com.application.bank.model.TransactionType;
import com.application.bank.payload.TransactionDTO;
import com.application.bank.repository.AccountRepository;
import com.application.bank.repository.TransactionRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TransactionServiceImpl implements TransactionService{

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    @Override
    public TransactionDTO deposit(String accountNumber, TransactionDTO transactionDTO) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("account", "account number", accountNumber));
        if(account.getAccountStatus().equals(AccountStatus.CLOSED) || account.getAccountStatus().equals(AccountStatus.INACTIVE)){
            throw new APIException("Money cant be deposited, as the account status is " + account.getAccountStatus() + ".");
        }
        if (transactionDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new APIException("Deposit amount must be greater than zero.");
        }
        BigDecimal newBal = account.getBalance().add(transactionDTO.getAmount()) ;
        account.setBalance(newBal);
        accountRepository.save(account);

        Transaction newTran = modelMapper.map(transactionDTO, Transaction.class);
        newTran.setAccount(account);
        String trxnId = "TRXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        newTran.setTrxnId(trxnId);
        newTran.setTransactionTime(LocalDateTime.now());
        newTran.setTransactionType(TransactionType.CREDIT);
        newTran.setBalanceAfterTransaction(account.getBalance());
        transactionRepository.save(newTran);
        TransactionDTO newTranDTO = modelMapper.map(newTran, TransactionDTO.class);
        newTranDTO.setAccountNumber(accountNumber);
        return newTranDTO;
    }

    @Override
    public TransactionDTO withdraw(String accountNumber, TransactionDTO transactionDTO) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("account", "account number", accountNumber));
        if(account.getAccountStatus().equals(AccountStatus.CLOSED) || account.getAccountStatus().equals(AccountStatus.INACTIVE)){
            throw new APIException("Money cant be deposited, as the account status is " + account.getAccountStatus() + ".");
        }
        if(account.getBalance().compareTo(transactionDTO.getAmount()) < 0){
            throw new APIException("Insufficient Balance. Your Current balance is " + account.getBalance() + ".");
        }

        BigDecimal newBal = account.getBalance().subtract(transactionDTO.getAmount());
        account.setBalance(newBal);
        accountRepository.save(account);

        Transaction newTran = modelMapper.map(transactionDTO, Transaction.class);
        newTran.setAccount(account);
        String trxnId = "TRXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        newTran.setTrxnId(trxnId);
        newTran.setTransactionTime(LocalDateTime.now());
        newTran.setTransactionType(TransactionType.DEBIT);
        newTran.setBalanceAfterTransaction(account.getBalance());
        transactionRepository.save(newTran);
        TransactionDTO newTranDTO = modelMapper.map(newTran, TransactionDTO.class);
        newTranDTO.setAccountNumber(accountNumber);
        return newTranDTO;
    }
}
