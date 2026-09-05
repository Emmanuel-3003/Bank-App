package com.application.bank.service;

import com.application.bank.exceptions.ResourceNotFoundException;
import com.application.bank.model.Account;
import com.application.bank.model.AccountStatus;
import com.application.bank.model.AccountType;
import com.application.bank.model.Customer;
import com.application.bank.payload.APIResponse;
import com.application.bank.payload.AccountDTO;
import com.application.bank.payload.AccountResponse;
import com.application.bank.repository.AccountRepository;
import com.application.bank.repository.CustomerRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class AccountServiceImpl implements AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public AccountDTO openAccount(AccountDTO accountDTO, Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));
        Account account = modelMapper.map(accountDTO, Account.class);

        account.setDateOfOpening(LocalDate.now());
        account.setAccountStatus(AccountStatus.ACTIVE);
        account.setBalance(BigDecimal.ZERO);
        account.setCustomer(customer);

        Account newAccount = accountRepository.save(account);
        newAccount.setAccountNumber(String.format("AC%06d", newAccount.getId()));
        newAccount = accountRepository.save(newAccount);
        return modelMapper.map(newAccount, AccountDTO.class);
    }

    @Override
    public String closeAccount(Long id) {
        return "";
    }

    @Override
    public AccountResponse getAccountsByCustomer(Long customerId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        return null;
    }

    @Override
    public String updateAccountStatus(String accountNumber, AccountStatus status) {
        Account accountFromDB = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "Acc. No. ", accountNumber));

        if(accountFromDB.getAccountStatus() == status){
            return "Account status is already " + status + "..";
        }
        accountFromDB.setAccountStatus(status);
        accountRepository.save(accountFromDB);
        return "Account status changed to " + status + "..";
    }
}
