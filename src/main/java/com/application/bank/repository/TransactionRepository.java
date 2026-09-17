package com.application.bank.repository;

import com.application.bank.model.Transaction;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByAccount_AccountNumber(String accountNumber, Pageable pageable);
    Page<Transaction> findByAccount_AccountNumberAndTransactionTimeBetween(
            String accountNumber, LocalDateTime fromDateTime, LocalDateTime toDateTime, Pageable pageable);
    Optional<Transaction> findTopByAccount_AccountNumberAndTransactionTimeBeforeOrderByTransactionTimeDesc(
            String accountNumber, LocalDateTime fromDateTime);
    List<Transaction> findByAccount_AccountNumber(String accountNumber);
    List<Transaction> findByAccount_AccountNumberAndTransactionTimeBetween(
            String accountNumber, LocalDateTime fromDateTime, LocalDateTime toDateTime);
}
