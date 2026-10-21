package com.application.bank.service;

import com.application.bank.model.Account;
import com.application.bank.model.AccountStatus;
import com.application.bank.model.Customer;
import com.application.bank.repository.AccountRepository;
import com.application.bank.repository.TransactionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock private AccountRepository accountRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private ModelMapper modelMapper;
    @InjectMocks private TransactionServiceImpl transactionService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }

    private Account accountOwnedBy(String email, String balance) {
        Customer owner = new Customer();
        owner.setEmail(email);

        Account account = new Account();
        account.setAccountNumber("AC000001");
        account.setBalance(new BigDecimal(balance));
        account.setAccountStatus(AccountStatus.ACTIVE);
        account.setCustomer(owner);
        return account;
    }

    @Test
    void setupWorks() {
    }
}