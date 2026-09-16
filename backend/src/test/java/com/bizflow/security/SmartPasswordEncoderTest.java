package com.bizflow.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SmartPasswordEncoderTest {

    private SmartPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new SmartPasswordEncoder();
    }

    @Test
    @DisplayName("Should encode and match standard BCrypt passwords")
    void testStandardBcrypt() {
        String rawPassword = "SecretPassword@123";
        String encoded = passwordEncoder.encode(rawPassword);

        assertNotNull(encoded);
        assertTrue(encoded.startsWith("$2a$") || encoded.startsWith("$2b$"));
        assertTrue(passwordEncoder.matches(rawPassword, encoded));
        assertFalse(passwordEncoder.matches("WrongPassword", encoded));
    }

    @Test
    @DisplayName("Should match plaintext passwords from legacy database entries")
    void testPlaintextFallback() {
        String storedPlaintext = "123456";
        assertTrue(passwordEncoder.matches("123456", storedPlaintext));
        assertTrue(passwordEncoder.matches(" 123456 ", storedPlaintext));
        assertFalse(passwordEncoder.matches("wrongpass", storedPlaintext));
    }

    @Test
    @DisplayName("Should match demo password fallback for demo user entries")
    void testDemoFallback() {
        assertTrue(passwordEncoder.matches("123456", "Owner@123456"));
        assertTrue(passwordEncoder.matches("123456", "Staff@123456"));
        assertTrue(passwordEncoder.matches("123456", "Admin@123456"));
    }

    @Test
    @DisplayName("Should safely handle null values without throwing exceptions")
    void testNullSafety() {
        assertNull(passwordEncoder.encode(null));
        assertFalse(passwordEncoder.matches(null, "somehash"));
        assertFalse(passwordEncoder.matches("somepass", null));
        assertFalse(passwordEncoder.matches(null, null));
    }
}
