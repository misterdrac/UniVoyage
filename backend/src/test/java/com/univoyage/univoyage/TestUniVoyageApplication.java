package com.univoyage.univoyage;

import org.springframework.boot.SpringApplication;

public class TestUniVoyageApplication {

	public static void main(String[] args) {
		SpringApplication.from(UniVoyageApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
