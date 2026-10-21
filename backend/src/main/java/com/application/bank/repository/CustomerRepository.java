package com.application.bank.repository;

import com.application.bank.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    //Customer findByEmail(String email);
    Optional <Customer> findByEmail(String email);

}
