package com.vbs.VirtualBankingSystem.repository;

import com.vbs.VirtualBankingSystem.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByCustomerIdOrderByTimestampDesc(Long customerId);
    
    @Query("SELECT t FROM Transaction t WHERE t.customer.id = :customerId ORDER BY t.timestamp DESC")
    List<Transaction> findTransactionsByCustomerIdOrderByTimestampDesc(@Param("customerId") Long customerId);
}

