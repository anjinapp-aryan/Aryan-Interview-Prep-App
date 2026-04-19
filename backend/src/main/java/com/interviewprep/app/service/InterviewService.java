package com.interviewprep.app.service;

import com.interviewprep.app.dto.InterviewRequest;
import com.interviewprep.app.dto.InterviewResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
public class InterviewService {

    private final GeminiService geminiService;
    private final Random random = new Random();

    public InterviewService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public InterviewResponse evaluateAnswer(InterviewRequest request) {
        try {
            log.info("Attempting evaluation with Gemini API...");
            return geminiService.evaluateWithGemini(request.getQuestion(), request.getAnswer());
        } catch (Exception e) {
            log.error("Failed to evaluate with Gemini API. Falling back to mock evaluation. Error: {}", e.getMessage());
            return generateMockEvaluation();
        }
    }

    private InterviewResponse generateMockEvaluation() {
        // Mock logic: Generate a random score between 0 and 10
        int score = random.nextInt(11);

        // Create simple feedback based on the score
        String feedback;
        if (score >= 8) {
            feedback = "Excellent answer! You demonstrated a clear understanding of the concept.";
        } else if (score >= 5) {
            feedback = "Good answer, but could be more detailed. Try to provide more concrete examples.";
        } else {
            feedback = "The answer needs improvement. Focus on clearly addressing the core question.";
        }

        // Add mock improvement tips
        List<String> improvementTips = Arrays.asList(
                "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
                "Keep your answers concise and directly to the point.",
                "Practice speaking confidently and clearly."
        );

        return InterviewResponse.builder()
                .score(score)
                .feedback(feedback)
                .improvementTips(improvementTips)
                .build();
    }
}
