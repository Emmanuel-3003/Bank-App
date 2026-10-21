package com.application.bank.security.service;

import com.application.bank.security.authenticationDTOs.LoginRequestDTO;
import com.application.bank.security.authenticationDTOs.LoginResponseDTO;
import com.application.bank.security.authenticationDTOs.RegisterRequestDTO;


public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequestDTO);
    String register(RegisterRequestDTO registerRequestDTO);
    String logout(String authHeader);
}
