package com.sdproject.WorkMate.attendance.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private String remarks; // e.g. "WFH approved by manager"
}
