package com.application.bank.service;

import com.application.bank.model.AccountStatus;
import com.application.bank.payload.APIResponse;
import com.application.bank.payload.AccountDTO;
import com.application.bank.payload.AccountResponse;

public interface AccountService {

    AccountDTO openAccount(AccountDTO accountDTO, Long customerId);
    String closeAccount(Long id);
    AccountResponse getAccountsByCustomer(Long customerId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    String updateAccountStatus(String accountNumber, AccountStatus status);
}
