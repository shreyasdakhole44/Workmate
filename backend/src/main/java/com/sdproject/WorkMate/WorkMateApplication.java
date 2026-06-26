package com.sdproject.WorkMate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkMateApplication {

	public static void main(String[] args) {
		System.out.println("lets go");
		String activeProfile = System.getenv("SPRING_PROFILES_ACTIVE");
		if ("production".equalsIgnoreCase(activeProfile)) {
			System.setProperty("spring.autoconfigure.exclude", 
				"org.springframework.ai.autoconfigure.transformers.TransformersEmbeddingModelAutoConfiguration," +
				"org.springframework.ai.model.transformers.autoconfigure.TransformersEmbeddingModelAutoConfiguration");
		}
		SpringApplication.run(WorkMateApplication.class, args);
	}


}
