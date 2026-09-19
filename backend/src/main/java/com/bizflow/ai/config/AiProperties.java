package com.bizflow.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "bizflow.ai")
public class AiProperties {

    private boolean enabled = true;
    private ProviderConfig openrouter = new ProviderConfig("meta-llama/llama-3.3-70b-instruct", "https://openrouter.ai/api/v1", 20000);
    private ProviderConfig gemini = new ProviderConfig("gemini-2.5-flash-lite", "https://generativelanguage.googleapis.com/v1beta", 20000);

    @Getter
    @Setter
    public static class ProviderConfig {
        private String apiKey = "";
        private String model;
        private String baseUrl;
        private int timeoutMs;

        public ProviderConfig() {
        }

        public ProviderConfig(String model, String baseUrl, int timeoutMs) {
            this.model = model;
            this.baseUrl = baseUrl;
            this.timeoutMs = timeoutMs;
        }

        public boolean isConfigured() {
            if (apiKey == null) return false;
            String trimmed = apiKey.trim();
            return !trimmed.isEmpty()
                    && !trimmed.equalsIgnoreCase("your_gemini_api_key_here")
                    && !trimmed.startsWith("<");
        }
    }
}
