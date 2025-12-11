package com.infosys.repository;

import com.infosys.model.Savings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SavingsRepository extends JpaRepository<Savings, Long> {
    List<Savings> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT SUM(s.amount) FROM Savings s WHERE s.userId = ?1")
    BigDecimal getTotalSavingsByUserId(Long userId);
}