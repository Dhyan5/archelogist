package com.sample.service;

import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    public String executePayment(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        if (amount > 10000) {
            if (amount > 50000) {
                return "REQUIRES_EXECUTIVE_APPROVAL";
            }
            return "REQUIRES_MANAGER_APPROVAL";
        }
        return "SUCCESS";
    }
}
