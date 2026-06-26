package com.sdproject.WorkMate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkMateApplication {

	public static void main(String[] args) {
		System.out.println("lets go");
		SpringApplication.run(WorkMateApplication.class, args);
	}

}
