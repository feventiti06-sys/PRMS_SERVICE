package com.erp.prms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.Scopes;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SwaggerConfig {

    private static final String SCHEME_NAME = "Keycloak";

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:8180/realms/prms}")
    private String issuerUri;

    @Bean
    @Primary
    OpenAPI prmsOpenApi() {
        String tokenUrl = issuerUri + "/protocol/openid-connect/token";

        OAuthFlow passwordFlow = new OAuthFlow()
                .tokenUrl(tokenUrl)
                .scopes(new Scopes()
                        .addString("openid", "OpenID")
                        .addString("profile", "Profile")
                        .addString("email", "Email"));

        SecurityScheme keycloakScheme = new SecurityScheme()
                .name(SCHEME_NAME)
                .type(SecurityScheme.Type.OAUTH2)
                .flows(new OAuthFlows().password(passwordFlow));

        return new OpenAPI()
                .info(new Info()
                        .title("PRMS API")
                        .version("1.0")
                        .description("Procurement Resource Management System — INSA ERP"))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SCHEME_NAME, keycloakScheme));
    }
}
