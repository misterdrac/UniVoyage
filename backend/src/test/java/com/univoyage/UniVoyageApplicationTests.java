package com.univoyage;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Basic smoke test that verifies the Spring application context starts successfully.
 */
@SpringBootTest
@ActiveProfiles("test")
class UniVoyageApplicationTests {

    @Test
    void contextLoads() {}
}