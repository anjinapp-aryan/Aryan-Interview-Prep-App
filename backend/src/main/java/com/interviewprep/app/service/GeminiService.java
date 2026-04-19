package com.interviewprep.app.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewprep.app.dto.InterviewResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public InterviewResponse evaluateWithGemini(String question, String answer) throws Exception {
        String prompt = "Evaluate the following interview answer.\n" +
                "Give:\n" +
                "1. Score out of 10\n" +
                "2. Detailed feedback\n" +
                "3. 3 improvement tips\n\n" +
                "Return strictly in JSON format:\n" +
                "{\n" +
                "  \"score\": number,\n" +
                "  \"feedback\": \"string\",\n" +
                "  \"improvementTips\": [\"string\"]\n" +
                "}\n\n" +
                "Question: " + question + "\n" +
                "Answer: " + answer;

        Map<String, Object> requestBody = buildGeminiRequestBody(prompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        String url = GEMINI_API_URL + geminiApiKey;

        log.info("Calling Gemini API for interview evaluation. Prompt length: {}", prompt.length());
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Received successful response from Gemini API");
                log.debug("Response body: {}", response.getBody());
                return parseGeminiResponse(response.getBody());
            } else {
                log.error("Gemini API returned an unexpected status: {}. Body: {}", response.getStatusCode(), response.getBody());
                throw new RuntimeException("Unexpected response from Gemini API");
            }
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            log.error("HTTP error from Gemini API. Status: {}, Response: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new RuntimeException("HTTP error from Gemini API: " + ex.getStatusCode());
        } catch (org.springframework.web.client.ResourceAccessException ex) {
            log.error("Timeout or network error accessing Gemini API: {}", ex.getMessage());
            throw new RuntimeException("Network error accessing Gemini API", ex);
        } catch (Exception ex) {
            log.error("Unexpected error during Gemini API call: {}", ex.getMessage());
            throw ex;
        }
    }

    private Map<String, Object> buildGeminiRequestBody(String prompt) {
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> partMap = new HashMap<>();
        partMap.put("parts", List.of(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(partMap));

        // Enforce JSON output format in generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }

    private InterviewResponse parseGeminiResponse(String responseBody) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        
        JsonNode candidates = rootNode.path("candidates");
        if (candidates.isMissingNode() || !candidates.isArray() || candidates.isEmpty()) {
            throw new RuntimeException("No candidates found in Gemini response");
        }

        JsonNode content = candidates.get(0).path("content");
        JsonNode parts = content.path("parts");
        
        if (parts.isMissingNode() || !parts.isArray() || parts.isEmpty()) {
            throw new RuntimeException("No parts found in Gemini response content");
        }

        String jsonText = parts.get(0).path("text").asText();
        
        // Sometimes the model returns markdown code block e.g. ```json ... ```
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.substring(7);
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.substring(3);
            if (jsonText.endsWith("```")) {
                jsonText = jsonText.substring(0, jsonText.length() - 3);
            }
        }
        
        return objectMapper.readValue(jsonText.trim(), InterviewResponse.class);
    }
}
