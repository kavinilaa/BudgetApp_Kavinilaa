package com.infosys.repository;

import com.infosys.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Income> findByUserId(Long userId);
    
    @Transactional
    void deleteByUserId(Long userId);
}