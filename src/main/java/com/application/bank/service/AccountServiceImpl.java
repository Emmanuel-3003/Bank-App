package com.application.bank.service;

import com.application.bank.exceptions.APIException;
import com.application.bank.exceptions.ResourceNotFoundException;
import com.application.bank.model.Account;
import com.application.bank.model.AccountStatus;
import com.application.bank.model.AccountType;
import com.application.bank.model.Customer;
import com.application.bank.payload.APIResponse;
import com.application.bank.payload.AccountDTO;
import com.application.bank.payload.AccountResponse;
import com.application.bank.payload.CustomerDTO;
import com.application.bank.repository.AccountRepository;
import com.application.bank.repository.CustomerRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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
    public AccountResponse getAccountsByCustomer(Long customerId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);

        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("customer", "customer ID", customerId));

        Page<Account> accountPage = accountRepository.findByCustomerId(customerId, pageDetails);
        List<Account> accounts = accountPage.getContent();

        List<AccountDTO> accountDTOS = accounts.stream()
                .map(acc -> {
                    AccountDTO dto = modelMapper.map(acc, AccountDTO.class);
                    dto.setCustomerId(customerId);
                    return dto;
                })
                .toList();

        AccountResponse accountResponse = new AccountResponse();
        accountResponse.setContent(accountDTOS);
        accountResponse.setPageNumber(pageNumber);
        accountResponse.setPageSize(pageSize);
        accountResponse.setTotalElements(accountPage.getTotalElements());
        accountResponse.setTotalPages(accountPage.getTotalPages());
        accountResponse.setLastPage(accountPage.isLast());
        return accountResponse;
    }

    @Override
    public AccountDTO updateAccountDetails(String accountNumber, AccountDTO accountDTO) {
        Account savedAccount = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("account", "account number", accountNumber));

        savedAccount.setAccountName(accountDTO.getAccountName());
        accountRepository.save(savedAccount);
        return modelMapper.map(savedAccount, AccountDTO.class);
    }

    @Override
    public String updateAccountStatus(String accountNumber, AccountStatus status) {
        Account accountFromDB = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "Acc. No. ", accountNumber));

        if(accountFromDB.getAccountStatus() == AccountStatus.CLOSED){
            return "Status cannot be changed as Account is already closed..";
        }
        if(accountFromDB.getAccountStatus() == status){
            return "Account status is already " + status + "..";
        }
        accountFromDB.setAccountStatus(status);
        accountRepository.save(accountFromDB);
        return "Account status changed to " + status + "..";
    }
}
