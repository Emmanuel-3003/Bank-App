package com.application.bank.controller;

import com.application.bank.config.AppConstants;
import com.application.bank.payload.StatementResponse;
import com.application.bank.payload.TransactionDTO;
import com.application.bank.payload.TransferRequestDTO;
import com.application.bank.payload.TransferResponseDTO;
import com.application.bank.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/account/{accountNumber}/deposit")
    public ResponseEntity<TransactionDTO> deposit(@PathVariable String accountNumber, @Valid @RequestBody TransactionDTO transactionDTO){
        TransactionDTO message = transactionService.deposit(accountNumber, transactionDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/account/{accountNumber}/withdraw")
    public ResponseEntity<TransactionDTO> withdraw(@PathVariable String accountNumber, @Valid @RequestBody TransactionDTO transactionDTO){
        TransactionDTO message = transactionService.withdraw(accountNumber, transactionDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/account/transfer")
    public ResponseEntity<TransferResponseDTO> transfer(@Valid @RequestBody TransferRequestDTO transferRequestDTO){
        TransferResponseDTO message = transactionService.transfer(transferRequestDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @GetMapping("/account/{accountNumber}/statements")
    public ResponseEntity<StatementResponse> getAccountStatements(
            @PathVariable String accountNumber,
            @RequestParam (name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam (name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam (name = "sortBy", defaultValue = AppConstants.SORT_TRANSACTION_BY, required = false) String sortBy,
            @RequestParam (name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "fromDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate){

        StatementResponse response = transactionService.getAccountStatement(accountNumber, fromDate, toDate, pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
