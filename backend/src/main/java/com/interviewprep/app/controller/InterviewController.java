package com.interviewprep.app.controller;

import com.interviewprep.app.dto.ApiResponse;
import com.interviewprep.app.dto.InterviewRequest;
import com.interviewprep.app.dto.InterviewResponse;
import com.interviewprep.app.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<ApiResponse<InterviewResponse>> evaluateAnswer(
            @Valid @RequestBody InterviewRequest request) {
        
        InterviewResponse evaluation = interviewService.evaluateAnswer(request);
        
        ApiResponse<InterviewResponse> response = new ApiResponse<>(
                true,
                "Evaluation completed successfully",
                evaluation
        );
        
        return ResponseEntity.ok(response);
    }
}
