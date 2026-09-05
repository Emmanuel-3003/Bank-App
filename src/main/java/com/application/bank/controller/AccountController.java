package com.application.bank.controller;

import com.application.bank.config.AppConstants;
import com.application.bank.model.AccountStatus;
import com.application.bank.payload.APIResponse;
import com.application.bank.payload.AccountDTO;
import com.application.bank.payload.AccountResponse;
import com.application.bank.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/customers/{customerId}/accounts")
    public ResponseEntity<AccountDTO> openAccount(@PathVariable Long customerId, @Valid @RequestBody AccountDTO accountDTO) {
        AccountDTO newAccount = accountService.openAccount(accountDTO, customerId);
        return new ResponseEntity<>(newAccount, HttpStatus.CREATED);
    }

    @PutMapping("/accounts/{accountNumber}/status/{status}")
    public ResponseEntity<APIResponse> updateAccountStatus(@PathVariable String accountNumber, @PathVariable AccountStatus status){
        String message = accountService.updateAccountStatus(accountNumber, status);
        APIResponse response = new APIResponse(message, true);
        return new ResponseEntity<> (response, HttpStatus.OK);
    }

    @GetMapping("/customers/{customerId}/accounts")
    public ResponseEntity<AccountResponse> getAccountsByCustomer(
            @PathVariable Long customerId,
            @RequestParam (name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam (name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam (name = "sortBy", defaultValue = AppConstants.SORT_CUSTOMER_BY, required = false) String sortBy,
            @RequestParam (name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder
    ){
        AccountResponse accountResponse = accountService.getAccountsByCustomer(customerId, pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(accountResponse, HttpStatus.OK);
    }
}
