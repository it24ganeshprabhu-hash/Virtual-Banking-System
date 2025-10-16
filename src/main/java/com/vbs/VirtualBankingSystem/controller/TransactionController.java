package com.vbs.VirtualBankingSystem.controller;

import com.vbs.VirtualBankingSystem.model.Transaction;
import com.vbs.VirtualBankingSystem.service.TransactionService;
import com.vbs.VirtualBankingSystem.dto.PassbookDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, maxAge = 3600)
public class TransactionController {
    @Autowired
    private TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<?> depositMoney(@RequestBody TransactionRequest request) {
        try {
            Transaction transaction = transactionService.depositMoney(
                    request.getCustomerId(),
                    request.getAmount(),
                    request.getDescription()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdrawMoney(@RequestBody TransactionRequest request) {
        try {
            Transaction transaction = transactionService.withdrawMoney(
                    request.getCustomerId(),
                    request.getAmount(),
                    request.getDescription()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(@RequestBody TransferRequest request) {
        try {
            List<Transaction> transactions = transactionService.transferMoney(
                    request.getFromCustomerId(),
                    request.getToCustomerId(),
                    request.getAmount(),
                    request.getDescription()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(transactions);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getCustomerTransactions(@PathVariable Long customerId) {
        try {
            List<Transaction> transactions = transactionService.getCustomerTransactions(customerId);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getTransaction(@PathVariable Long transactionId) {
        try {
            Transaction transaction = transactionService.getTransactionById(transactionId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/customer/{customerId}/passbook")
    public ResponseEntity<?> getCustomerPassbook(@PathVariable Long customerId) {
        try {
            PassbookDTO passbook = transactionService.getCustomerPassbook(customerId);
            return ResponseEntity.ok(passbook);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/debug/customer/{customerId}")
    public ResponseEntity<?> debugCustomerTransactions(@PathVariable Long customerId) {
        try {
            List<Transaction> transactions = transactionService.getCustomerTransactions(customerId);

            Map<String, Object> debug = new HashMap<>();
            debug.put("customerId", customerId);
            debug.put("transactionCount", transactions.size());
            debug.put("transactions", transactions);
            debug.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.ok(debug);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Inner class for transaction request
    public static class TransactionRequest {
        private Long customerId;
        private BigDecimal amount;
        private String description;

        public Long getCustomerId() {
            return customerId;
        }

        public void setCustomerId(Long customerId) {
            this.customerId = customerId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    // Inner class for transfer request
    public static class TransferRequest {
        private Long fromCustomerId;
        private Long toCustomerId;
        private BigDecimal amount;
        private String description;

        public Long getFromCustomerId() {
            return fromCustomerId;
        }

        public void setFromCustomerId(Long fromCustomerId) {
            this.fromCustomerId = fromCustomerId;
        }

        public Long getToCustomerId() {
            return toCustomerId;
        }

        public void setToCustomerId(Long toCustomerId) {
            this.toCustomerId = toCustomerId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}