package com.clinisign;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class CliniSignApplication {
    public static void main(String[] args) {
        SpringApplication.run(CliniSignApplication.class, args);
    }
}
