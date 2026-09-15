package com.application.bank.controller;

import com.application.bank.payload.TransactionDTO;
import com.application.bank.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/account/{accountNumber}/deposit")
    public ResponseEntity<TransactionDTO> deposit(@PathVariable String accountNumber, @RequestBody TransactionDTO transactionDTO){
        TransactionDTO message = transactionService.deposit(accountNumber, transactionDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PostMapping("/account/{accountNumber}/withdraw")
    public ResponseEntity<TransactionDTO> withdraw(@PathVariable String accountNumber, @RequestBody TransactionDTO transactionDTO){
        TransactionDTO message = transactionService.withdraw(accountNumber, transactionDTO);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
