package com.application.bank.service;

import com.application.bank.exceptions.APIException;
import com.application.bank.exceptions.ResourceNotFoundException;
import com.application.bank.model.Account;
import com.application.bank.model.AccountStatus;
import com.application.bank.model.Transaction;
import com.application.bank.model.TransactionType;
import com.application.bank.payload.TransactionDTO;
import com.application.bank.payload.TransferRequestDTO;
import com.application.bank.payload.TransferResponseDTO;
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
            throw new APIException("Money cant be deposited, as your account status is " + account.getAccountStatus() + ".");
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

    @Transactional
    @Override
    public TransactionDTO withdraw(String accountNumber, TransactionDTO transactionDTO) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("account", "account number", accountNumber));
        if(account.getAccountStatus().equals(AccountStatus.CLOSED) || account.getAccountStatus().equals(AccountStatus.INACTIVE)){
            throw new APIException("Money can't be withdrawn, as your account status is " + account.getAccountStatus() + ".");
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

    @Transactional
    @Override
    public TransferResponseDTO transfer(TransferRequestDTO transferRequestDTO) {
        Account fromAcc = accountRepository.findByAccountNumber(transferRequestDTO.getFromAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("account", "account number", transferRequestDTO.getFromAccountNumber()));
        Account toAcc = accountRepository.findByAccountNumber(transferRequestDTO.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("account", "account number", transferRequestDTO.getToAccountNumber()));

        if(fromAcc.getAccountStatus().equals(AccountStatus.CLOSED) || fromAcc.getAccountStatus().equals(AccountStatus.INACTIVE)){
            throw new APIException("Money can't be transferred, as your account status is " + fromAcc.getAccountStatus() + ".");
        } else if (toAcc.getAccountStatus().equals(AccountStatus.CLOSED) || toAcc.getAccountStatus().equals(AccountStatus.INACTIVE)){
            throw new APIException("Money can't be received, as their account status is " + toAcc.getAccountStatus() + ".");
        }
        if (transferRequestDTO.getFromAccountNumber().equals(transferRequestDTO.getToAccountNumber())) {
            throw new APIException("Cannot transfer to the same account.");
        }
        if (transferRequestDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new APIException("Transfer amount must be greater than zero.");
        }
        if(fromAcc.getBalance().compareTo(transferRequestDTO.getAmount()) < 0){
            throw new APIException("Insufficient Balance. Your Current balance is " + fromAcc.getBalance() + ".");
        }

        BigDecimal fromAccNewBal = fromAcc.getBalance().subtract(transferRequestDTO.getAmount());
        BigDecimal toAccNewBal = toAcc.getBalance().add(transferRequestDTO.getAmount());

        fromAcc.setBalance(fromAccNewBal);
        toAcc.setBalance(toAccNewBal);
        accountRepository.save(fromAcc);
        accountRepository.save(toAcc);

        String trxnId = "TRXN" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        //From account Transaction details
        Transaction newFromTran =  new Transaction(
                trxnId,
                fromAcc,
                transferRequestDTO.getAmount(),
                LocalDateTime.now(),
                TransactionType.DEBIT,
                fromAcc.getBalance(),
                transferRequestDTO.getTrxnNote()
        );
        transactionRepository.save(newFromTran);

        //To account Transaction details
        Transaction newToTran =  new Transaction(
                trxnId,
                toAcc,
                transferRequestDTO.getAmount(),
                LocalDateTime.now(),
                TransactionType.CREDIT,
                toAcc.getBalance(),
                transferRequestDTO.getTrxnNote()
        );
        transactionRepository.save(newToTran);

        TransferResponseDTO tranResponse = new TransferResponseDTO(
                trxnId,
                fromAcc.getAccountNumber(),
                toAcc.getAccountNumber(),
                transferRequestDTO.getAmount(),
                fromAcc.getBalance(),
                toAcc.getBalance(),
                LocalDateTime.now(),
                transferRequestDTO.getTrxnNote());
        return tranResponse;
    }
}
