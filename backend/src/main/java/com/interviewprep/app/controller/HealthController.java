package com.interviewprep.app.controller;

import com.interviewprep.app.dto.ApiResponse;
import com.interviewprep.app.service.HealthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final HealthService healthService;

    @Autowired
    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/health")
    public ApiResponse<String> healthCheck() {
        return new ApiResponse<>(true, "Success", healthService.getHealthStatus());
    }
}
