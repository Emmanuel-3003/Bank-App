package com.application.bank.controller;

import com.application.bank.config.AppConstants;
import com.application.bank.payload.APIResponse;
import com.application.bank.payload.CustomerDTO;
import com.application.bank.payload.CustomerResponse;
import com.application.bank.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping("/customers")
    public ResponseEntity<CustomerDTO> createCustomer(@Valid @RequestBody CustomerDTO customerDTO) {
        CustomerDTO createdCustomerDTO = customerService.createCustomer(customerDTO);
        return new ResponseEntity<>(createdCustomerDTO, HttpStatus.CREATED);
    }

    @GetMapping("/customers")
    public ResponseEntity<CustomerResponse> getAllCustomer(
            @RequestParam (name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam (name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam (name = "sortBy", defaultValue = AppConstants.SORT_CUSTOMER_BY, required = false) String sortBy,
            @RequestParam (name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder
    ) {
        CustomerResponse customerResponse = customerService.getAllCustomers(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(customerResponse, HttpStatus.OK);
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerDTO customerDTO) {
        CustomerDTO customer = customerService.updateCustomer(customerDTO, id);
        return new ResponseEntity<>(customer, HttpStatus.OK);
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<APIResponse> deleteCustomer(@PathVariable Long id){
        String message = customerService.deleteCustomer(id);
        APIResponse deleteResponse = new APIResponse(message, true);
        return new ResponseEntity<>(deleteResponse, HttpStatus.OK);
    }
}
