package com.application.bank.service;

import com.application.bank.exceptions.APIException;
import com.application.bank.exceptions.ResourceNotFoundException;
import com.application.bank.model.Customer;
import com.application.bank.payload.CustomerDTO;
import com.application.bank.payload.CustomerResponse;
import com.application.bank.repository.CustomerRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CustomerDTO updateCustomer(CustomerDTO customerDTO, Long id) {
        Customer savedCustomer = customerRepository.findById(id).
                orElseThrow(() -> new ResourceNotFoundException("Customer", "ID", id));

        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!savedCustomer.getEmail().equals(authenticatedEmail)) {
            throw new APIException("You do not have permission to access this customer.");
        }

        Customer customer =  modelMapper.map(customerDTO, Customer.class);

        //Updating customer details
        savedCustomer.setFirstName(customer.getFirstName());
        savedCustomer.setLastName(customer.getLastName());
        //savedCustomer.setEmail(customer.getEmail());
        savedCustomer.setDateOfBirth(customer.getDateOfBirth());
        savedCustomer.setAddress(customer.getAddress());
        savedCustomer.setCity(customer.getCity());
        savedCustomer.setState(customer.getState());
        savedCustomer.setCountry(customer.getCountry());
        savedCustomer.setPinCode(customer.getPinCode());

        Customer updatedCustomer = customerRepository.save(savedCustomer);
        return modelMapper.map(updatedCustomer, CustomerDTO.class);
    }

    @Override
    public String deleteCustomer(Long id) {
        Customer savedCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "ID", id));

        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!savedCustomer.getEmail().equals(authenticatedEmail)) {
            throw new APIException("You do not have permission to access this customer.");
        }

        customerRepository.delete(savedCustomer);
        return "Customer with ID " + id + " deleted successfully..";
    }

    @Override
    public CustomerDTO getMyProfile() {
        String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customerFromDB = customerRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "email", authenticatedEmail));
        return modelMapper.map(customerFromDB, CustomerDTO.class);
    }

    /*@Override
    public CustomerResponse getAllCustomers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails =  PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Customer> customerPage = customerRepository.findAll(pageDetails);
        List<Customer> customers =  customerPage.getContent();

        List<CustomerDTO> customerDTOS = customers.stream()
                .map(customer -> modelMapper.map(customer, CustomerDTO.class))
                .toList();
        CustomerResponse customerResponse = new CustomerResponse();
        customerResponse.setContent(customerDTOS);
        customerResponse.setPageNumber(customerPage.getNumber());
        customerResponse.setPageSize(customerPage.getSize());
        customerResponse.setTotalElements(customerPage.getTotalElements());
        customerResponse.setTotalPages(customerPage.getTotalPages());
        customerResponse.setLastPage(customerPage.isLast());
        return customerResponse;
    }*/
}
