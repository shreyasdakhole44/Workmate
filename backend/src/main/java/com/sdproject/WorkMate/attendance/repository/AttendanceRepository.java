package com.sdproject.WorkMate.attendance.repository;

import com.sdproject.WorkMate.attendance.entity.AttendanceLog;
import com.sdproject.WorkMate.attendance.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceLog, Long> {

    Optional<AttendanceLog> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<AttendanceLog> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT a FROM AttendanceLog a JOIN FETCH a.employee WHERE a.date = :date")
    List<AttendanceLog> findByDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM AttendanceLog a JOIN FETCH a.employee e JOIN FETCH e.user WHERE a.date = :date AND a.checkOutTime IS NULL")
    List<AttendanceLog> findByDateAndCheckOutTimeIsNull(@Param("date") LocalDate date);

    long countByEmployeeIdAndStatusAndDateBetween(Long employeeId, AttendanceStatus status, LocalDate startDate, LocalDate endDate);
}
