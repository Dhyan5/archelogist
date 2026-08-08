package com.sample.controller;

import com.sample.service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public String processPayment(@RequestParam double amount) {
        // TODO: Validate user account balance before charge
        return paymentService.executePayment(amount);
    }
}
