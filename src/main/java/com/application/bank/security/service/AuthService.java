package com.application.bank.security.service;

import com.application.bank.security.LoginRequestDTO;
import com.application.bank.security.LoginResponseDTO;
import com.application.bank.security.RegisterRequestDTO;


public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequestDTO);
    String register(RegisterRequestDTO registerRequestDTO);
    String logout(String authHeader);
}
