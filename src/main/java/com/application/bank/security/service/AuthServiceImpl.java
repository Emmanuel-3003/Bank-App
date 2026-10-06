package com.application.bank.security.service;

import com.application.bank.exceptions.APIException;
import com.application.bank.model.BlacklistedToken;
import com.application.bank.model.Customer;
import com.application.bank.repository.BlacklistedTokenRepository;
import com.application.bank.repository.CustomerRepository;
import com.application.bank.security.LoginRequestDTO;
import com.application.bank.security.LoginResponseDTO;
import com.application.bank.security.RegisterRequestDTO;
import com.application.bank.security.jwt.JwtUtils;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Override
    public String register(RegisterRequestDTO registerRequestDTO) {
        if (customerRepository.findByEmail(registerRequestDTO.getEmail()).isPresent()) {
            throw new APIException("Customer with email " + registerRequestDTO.getEmail() + " already exists..");
        }

        Customer customer = modelMapper.map(registerRequestDTO, Customer.class);
        customer.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
        customer.setDateOfJoining(LocalDate.now());

        Customer savedCustomer = customerRepository.save(customer);
        savedCustomer.setCustomerCode(String.format("CU%06d", savedCustomer.getId()));
        customerRepository.save(savedCustomer);

        return "Registration successful for " + savedCustomer.getEmail();
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        try{
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequestDTO.getEmail(), loginRequestDTO.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new APIException("Invalid email or password..");
        }
        String token = jwtUtils.generateToken(loginRequestDTO.getEmail());
        return new LoginResponseDTO(loginRequestDTO.getEmail(), token);
    }

    @Override
    public String logout(String authHeader) {
        if(authHeader != null && authHeader.startsWith("Bearer ")){
            String token = authHeader.substring(7);
            Date expiry = jwtUtils.extractExpiration(token);

            BlacklistedToken blacklistedToken = new BlacklistedToken();
            blacklistedToken.setToken(token);
            blacklistedToken.setExpiryDate(expiry);
            blacklistedTokenRepository.save(blacklistedToken);
        }
        return "Logged Out successfully...";
    }

}
