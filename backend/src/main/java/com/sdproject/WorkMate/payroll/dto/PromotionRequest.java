package com.sdproject.WorkMate.payroll.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionRequest {
    private String newRole;
    private String newDesignation;
    private BigDecimal newSalary;
    private String notes;
}
