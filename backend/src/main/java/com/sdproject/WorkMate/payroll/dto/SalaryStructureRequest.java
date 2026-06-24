package com.sdproject.WorkMate.payroll.dto;

import lombok.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryStructureRequest {
    @NotNull(message = "Basic salary is required")
    private BigDecimal basicSalary;

    @NotNull(message = "HRA is required")
    private BigDecimal hra;

    @NotNull(message = "Medical allowance is required")
    private BigDecimal medicalAllowance;

    @NotNull(message = "Other allowances is required")
    private BigDecimal otherAllowances;

    @NotNull(message = "Provident fund is required")
    private BigDecimal providentFund;

    @NotNull(message = "Professional tax is required")
    private BigDecimal professionalTax;

    @NotNull(message = "Special allowance is required")
    private BigDecimal specialAllowance;

    @NotNull(message = "Conveyance allowance is required")
    private BigDecimal conveyanceAllowance;

    @NotNull(message = "Performance bonus is required")
    private BigDecimal performanceBonus;

    @NotNull(message = "Income tax is required")
    private BigDecimal incomeTax;

    @NotNull(message = "ESI is required")
    private BigDecimal esi;
}
