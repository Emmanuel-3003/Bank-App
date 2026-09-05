package com.application.bank.service;

import com.application.bank.payload.CustomerDTO;
import com.application.bank.payload.CustomerResponse;

public interface CustomerService {

    CustomerDTO createCustomer(CustomerDTO customerDTO);
    CustomerDTO updateCustomer(CustomerDTO customerDTO, Long id);
    String deleteCustomer(Long id);
    CustomerResponse getAllCustomers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
}
