package com.bizflow;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@SpringBootApplication
public class BizFlowApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BizFlowApplication.class, args);
    }

    public static void loadDotEnv() {
        List<File> candidates = List.of(
                new File(".env"),
                new File("../.env"),
                new File("../../.env")
        );

        for (File file : candidates) {
            if (file.exists() && file.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        String key = line.substring(0, eqIdx).trim();
                        String val = line.substring(eqIdx + 1).trim();

                        // Strip surrounding single or double quotes
                        if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                            if (val.length() >= 2) {
                                val = val.substring(1, val.length() - 1);
                            }
                        }

                        // Set system property if not already set by JVM or OS environment
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }

                        // Also sync GEMINI_API_KEY <-> BIZFLOW_AI_GEMINI_API_KEY
                        if ("BIZFLOW_AI_GEMINI_API_KEY".equals(key) && System.getProperty("GEMINI_API_KEY") == null && System.getenv("GEMINI_API_KEY") == null) {
                            System.setProperty("GEMINI_API_KEY", val);
                        }
                        if ("GEMINI_API_KEY".equals(key) && System.getProperty("BIZFLOW_AI_GEMINI_API_KEY") == null && System.getenv("BIZFLOW_AI_GEMINI_API_KEY") == null) {
                            System.setProperty("BIZFLOW_AI_GEMINI_API_KEY", val);
                        }
                    }
                    log.info("Successfully loaded environment variables from: {}", file.getAbsolutePath());
                    break;
                } catch (Exception e) {
                    log.warn("Could not read .env file from {}: {}", file.getAbsolutePath(), e.getMessage());
                }
            }
        }
    }
}

