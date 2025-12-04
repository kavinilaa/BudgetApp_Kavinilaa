package com.infosys.repository;

import com.infosys.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Expense> findByUserId(Long userId);
    
    @Transactional
    void deleteByUserId(Long userId);
}