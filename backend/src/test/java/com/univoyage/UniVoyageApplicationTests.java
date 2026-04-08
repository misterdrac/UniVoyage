package com.univoyage;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Application bootstrap smoke test.
 * <p>
 * Verifies that the full Spring context loads with the {@code test} profile (including Flyway,
 * JPA, and security wiring) without starting focused slices that exclude beans.
 * </p>
 */
@SpringBootTest
@ActiveProfiles("test")
class UniVoyageApplicationTests {

    /**
     * Loads the Spring {@link org.springframework.context.ApplicationContext}; fails if any bean
     * definition or post-processing errors occur during startup.
     */
    @Test
    void contextLoads() {}
}