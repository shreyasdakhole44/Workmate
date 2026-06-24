package com.sdproject.WorkMate.leave.repository;

import com.sdproject.WorkMate.leave.entity.LeaveRequest;
import com.sdproject.WorkMate.leave.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByEmployeeId(Long employeeId);
    
    List<LeaveRequest> findByStatus(LeaveStatus status);
}
