package com.application.bank.repository;

import com.application.bank.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Account findByCustomer(String customer);
    Optional<Account> findByAccountNumber(String accountNumber);
}
