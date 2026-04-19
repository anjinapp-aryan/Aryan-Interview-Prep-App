package com.interviewprep.app.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {

    @NotBlank(message = "Question must not be empty or null")
    private String question;

    @NotBlank(message = "Answer must not be empty or null")
    private String answer;
}
