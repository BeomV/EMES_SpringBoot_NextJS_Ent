package com.emes.api;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * EMES Platform Main Application
 */
@SpringBootApplication(scanBasePackages = "com.emes")
@MapperScan("com.emes.core.domain.mapper")
public class EmesApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmesApplication.class, args);
    }
}
