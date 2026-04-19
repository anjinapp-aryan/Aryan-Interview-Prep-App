package com.interviewprep.app.service;

import org.springframework.stereotype.Service;

@Service
public class HealthService {
    
    public String getHealthStatus() {
        return "AI Interview Prep Backend is running";
    }
}
