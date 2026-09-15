package com.application.bank.controller;

import com.application.bank.payload.TransactionDTO;
import com.application.bank.payload.TransferRequestDTO;
import com.application.bank.payload.TransferResponseDTO;
import com.application.bank.service.TransactionService;
import jakarta.validation.Valid;
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
}
