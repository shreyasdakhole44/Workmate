package com.sdproject.WorkMate.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DraftReviewRequest {
    private String employeeName;
    private String designation;
    private Double score;
    private String managerNotes;
}
