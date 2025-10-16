package com.vbs.VirtualBankingSystem.service;

import com.vbs.VirtualBankingSystem.model.Customer;
import com.vbs.VirtualBankingSystem.model.Transaction;
import com.vbs.VirtualBankingSystem.repository.TransactionRepository;
import com.vbs.VirtualBankingSystem.dto.PassbookDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomerService customerService;

    public Transaction depositMoney(Long customerId, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero");
        }

        Customer customer = customerService.getCustomerById(customerId);

        // Update customer balance
        BigDecimal newBalance = customer.getBalance().add(amount);
        customer.setBalance(newBalance);
        customerService.updateCustomerBalance(customer);

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setType(Transaction.TransactionType.DEPOSIT);
        transaction.setAmount(amount);
        transaction.setBalanceAfterTransaction(newBalance);
        transaction.setDescription(description != null ? description : "Money deposited");
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setCustomer(customer);

        return transactionRepository.save(transaction);
    }

    public Transaction withdrawMoney(Long customerId, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Withdrawal amount must be greater than zero");
        }

        Customer customer = customerService.getCustomerById(customerId);

        // Check if customer has sufficient balance
        if (customer.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance. Available balance: " + customer.getBalance());
        }

        // Update customer balance
        BigDecimal newBalance = customer.getBalance().subtract(amount);
        customer.setBalance(newBalance);
        customerService.updateCustomerBalance(customer);

        // Create transaction record
        Transaction transaction = new Transaction();
        transaction.setType(Transaction.TransactionType.WITHDRAWAL);
        transaction.setAmount(amount);
        transaction.setBalanceAfterTransaction(newBalance);
        transaction.setDescription(description != null ? description : "Money withdrawn");
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setCustomer(customer);

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getCustomerTransactions(Long customerId) {
        return transactionRepository.findByCustomerIdOrderByTimestampDesc(customerId);
    }

    public Transaction getTransactionById(Long transactionId) {
        return transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));
    }

    public PassbookDTO getCustomerPassbook(Long customerId) {
        Customer customer = customerService.getCustomerById(customerId);
        List<Transaction> transactions = transactionRepository.findByCustomerIdOrderByTimestampDesc(customerId);

        List<PassbookDTO.TransactionSummaryDTO> transactionSummaries = transactions.stream()
                .map(t -> new PassbookDTO.TransactionSummaryDTO(
                        t.getId(),
                        t.getType().toString(),
                        t.getAmount(),
                        t.getBalanceAfterTransaction(),
                        t.getDescription(),
                        t.getTimestamp()
                ))
                .collect(Collectors.toList());

        return new PassbookDTO(
                customer.getId(),
                customer.getFirstName() + " " + customer.getLastName(),
                customer.getBalance(),
                transactions.size(),
                transactionSummaries
        );
    }

    public List<Transaction> transferMoney(Long fromCustomerId, Long toCustomerId, BigDecimal amount, String description) {
        // Validation checks
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero");
        }

        if (fromCustomerId.equals(toCustomerId)) {
            throw new RuntimeException("Cannot transfer money to the same account");
        }

        // Get both customers and validate they exist
        Customer fromCustomer = customerService.getCustomerById(fromCustomerId);
        Customer toCustomer = customerService.getCustomerById(toCustomerId);

        // Check if sender has sufficient balance
        if (fromCustomer.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance. Available balance: " + fromCustomer.getBalance());
        }

        // Update balances
        BigDecimal fromNewBalance = fromCustomer.getBalance().subtract(amount);
        BigDecimal toNewBalance = toCustomer.getBalance().add(amount);

        fromCustomer.setBalance(fromNewBalance);
        toCustomer.setBalance(toNewBalance);

        // Update customer balances in database
        customerService.updateCustomerBalance(fromCustomer);
        customerService.updateCustomerBalance(toCustomer);

        // Create debit transaction for sender
        Transaction debitTransaction = new Transaction();
        debitTransaction.setType(Transaction.TransactionType.WITHDRAWAL);
        debitTransaction.setAmount(amount);
        debitTransaction.setBalanceAfterTransaction(fromNewBalance);
        debitTransaction.setDescription(description != null ?
                "Transfer to " + toCustomer.getFirstName() + " " + toCustomer.getLastName() + " - " + description :
                "Transfer to " + toCustomer.getFirstName() + " " + toCustomer.getLastName());
        debitTransaction.setTimestamp(LocalDateTime.now());
        debitTransaction.setCustomer(fromCustomer);

        // Create credit transaction for recipient
        Transaction creditTransaction = new Transaction();
        creditTransaction.setType(Transaction.TransactionType.DEPOSIT);
        creditTransaction.setAmount(amount);
        creditTransaction.setBalanceAfterTransaction(toNewBalance);
        creditTransaction.setDescription(description != null ?
                "Transfer from " + fromCustomer.getFirstName() + " " + fromCustomer.getLastName() + " - " + description :
                "Transfer from " + fromCustomer.getFirstName() + " " + fromCustomer.getLastName());
        creditTransaction.setTimestamp(LocalDateTime.now());
        creditTransaction.setCustomer(toCustomer);

        // Save both transactions
        Transaction savedDebitTransaction = transactionRepository.save(debitTransaction);
        Transaction savedCreditTransaction = transactionRepository.save(creditTransaction);

        // Return both transactions
        return List.of(savedDebitTransaction, savedCreditTransaction);
    }
}