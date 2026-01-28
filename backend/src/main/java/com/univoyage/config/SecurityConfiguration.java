package com.univoyage.config;

import com.univoyage.auth.security.JwtAuthenticationFilter;
import com.univoyage.exception.security.RestAccessDeniedHandler;
import com.univoyage.exception.security.RestAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> builder.featuresToDisable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Dopusti OPTIONS za CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Javne rute (Error, Actuator)
                        .requestMatchers("/error", "/actuator/**").permitAll()

                        // 3. Specifične Auth rute koje MORAJU biti javne
                        .requestMatchers("/api/auth/login/**", "/api/auth/register/**").permitAll()
                        .requestMatchers("/api/auth/google/**").permitAll()

                        // 4. Javni dohvat destinacija
                        .requestMatchers(HttpMethod.GET, "/api/destinations/**").permitAll()

                        // 5. Admin rute
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "HEAD_ADMIN")

                        // 6. Sve ostalo pod /api/auth/ (poput /me) mora biti ulogirano
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/auth/**").authenticated()

                        // 7. Sigurnosni "catch-all"
                        .anyRequest().authenticated()
                )
                .exceptionHandling(eh -> eh
                        .authenticationEntryPoint(restAuthenticationEntryPoint)
                        .accessDeniedHandler(restAccessDeniedHandler)
                )
                // Dodajemo filter na pravo mjesto
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}