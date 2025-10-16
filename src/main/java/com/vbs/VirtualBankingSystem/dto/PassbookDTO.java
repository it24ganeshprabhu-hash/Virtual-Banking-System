package com.vbs.VirtualBankingSystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PassbookDTO {
    private Long customerId;
    private String customerName;
    private BigDecimal currentBalance;
    private int totalTransactions;
    private List<TransactionSummaryDTO> transactions;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummaryDTO {
        private Long id;
        private String type;
        private BigDecimal amount;
        private BigDecimal balanceAfterTransaction;
        private String description;
        private LocalDateTime timestamp;
    }
}
