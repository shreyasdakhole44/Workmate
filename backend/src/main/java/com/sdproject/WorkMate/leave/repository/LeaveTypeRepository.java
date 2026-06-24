package com.sdproject.WorkMate.leave.repository;

import com.sdproject.WorkMate.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    
    List<LeaveType> findByIsActive(Boolean isActive);
}
