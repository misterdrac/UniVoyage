package com.univoyage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Main application class for UniVoyage.
 */
@SpringBootApplication(scanBasePackages = "com.univoyage")
@EnableJpaRepositories(basePackages = "com.univoyage")
@EntityScan(basePackages = "com.univoyage")
public class UniVoyageApplication {

	public static void main(String[] args) {
		SpringApplication.run(UniVoyageApplication.class, args);
	}

}
