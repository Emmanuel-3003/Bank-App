package com.application.bank.security;

import com.application.bank.repository.BlacklistedTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Component
public class TokenCleanupScheduler {

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    @Scheduled(fixedRate = 3600000) // every hour
    @Transactional
    public void removeExpiredTokens() {
        blacklistedTokenRepository.deleteByExpiryDateBefore(new Date());
    }
}
