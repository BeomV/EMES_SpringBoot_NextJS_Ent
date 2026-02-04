package com.emes.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * EMES Platform Main Application
 */
@SpringBootApplication(scanBasePackages = "com.emes")
public class EmesApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmesApplication.class, args);
    }
}
