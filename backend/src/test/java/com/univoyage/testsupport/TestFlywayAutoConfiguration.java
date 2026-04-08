package com.univoyage.testsupport;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

/**
 * Integration tests use a disposable {@code univoyage_test} DB. If a migration file
 * (e.g. V1) changes after it was applied, Flyway 11+ no longer supports
 * {@code cleanOnValidationError}. Cleaning then migrating keeps {@code mvn package} working.
 */
@AutoConfiguration(before = FlywayAutoConfiguration.class)
@ConditionalOnClass(name = "org.flywaydb.core.Flyway")
@Profile("test")
public class TestFlywayAutoConfiguration {

    @Bean
    FlywayMigrationStrategy testFlywayMigrationStrategy() {
        return flyway -> {
            flyway.clean();
            flyway.migrate();
        };
    }
}
