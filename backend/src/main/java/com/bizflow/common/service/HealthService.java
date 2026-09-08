package com.bizflow.common.service;

import com.bizflow.common.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthService {

    private final DataSource dataSource;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public HealthResponse getHealthStatus() {
        String dbStatus = checkDatabaseConnection();
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        String overallStatus = "CONNECTED".equals(dbStatus) ? "UP" : "DEGRADED";

        return HealthResponse.builder()
                .status(overallStatus)
                .service("BizFlow Backend API")
                .version("1.0.0")
                .environment(activeProfile)
                .database(dbStatus)
                .uptimeSeconds(uptimeSeconds)
                .timestamp(Instant.now())
                .build();
    }

    private String checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            statement.execute("SELECT 1");
            return "CONNECTED";
        } catch (Exception ex) {
            log.error("Database health check failed: {}", ex.getMessage());
            return "DISCONNECTED";
        }
    }
}
