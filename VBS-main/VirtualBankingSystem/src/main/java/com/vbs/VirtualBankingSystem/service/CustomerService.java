package com.vbs.VirtualBankingSystem.service;

import com.vbs.VirtualBankingSystem.model.Customer;
import com.vbs.VirtualBankingSystem.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    
    public Customer registerCustomer(Customer customer) {
        // Check if username already exists
        if (customerRepository.existsByUsername(customer.getUsername())) {
            throw new RuntimeException("Username already exists: " + customer.getUsername());
        }
        
        // Check if email already exists
        if (customerRepository.existsByEmail(customer.getEmail())) {
            throw new RuntimeException("Email already exists: " + customer.getEmail());
        }
        
        return customerRepository.save(customer);
    }
    
    public Customer loginCustomer(String username, String password) {
        Optional<Customer> customer = customerRepository.findByUsername(username);
        
        if (customer.isPresent() && customer.get().getPassword().equals(password)) {
            return customer.get();
        } else {
            throw new RuntimeException("Invalid username or password");
        }
    }
    
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
    }
    
    public Customer getCustomerByUsername(String username) {
        return customerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found with username: " + username));
    }
    
    public Customer updateCustomerBalance(Customer customer) {
        return customerRepository.save(customer);
    }
    
    public boolean existsByUsername(String username) {
        return customerRepository.existsByUsername(username);
    }
    
    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email);
    }
}

