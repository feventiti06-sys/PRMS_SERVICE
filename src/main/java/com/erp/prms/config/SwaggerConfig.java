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

@Configuration
public class SwaggerConfig {

    private static final String OAUTH2_SCHEME = "oauth2";

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:http://localhost:8180/realms/prms}")
    private String issuerUri;

    @Bean
    OpenAPI prmsOpenApi() {
        String tokenUrl = issuerUri + "/protocol/openid-connect/token";

        Scopes scopes = new Scopes()
                .addString("openid", "OpenID Connect")
                .addString("profile", "User profile")
                .addString("email", "User email");

        OAuthFlow passwordFlow = new OAuthFlow()
                .tokenUrl(tokenUrl)
                .scopes(scopes);

        SecurityScheme oauth2Scheme = new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .flows(new OAuthFlows().password(passwordFlow));

        return new OpenAPI()
                .info(new Info()
                        .title("PRMS API")
                        .version("1.0")
                        .description("Procurement Resource Management System — INSA"))
                .addSecurityItem(new SecurityRequirement().addList(OAUTH2_SCHEME))
                .components(new Components().addSecuritySchemes(OAUTH2_SCHEME, oauth2Scheme));
    }
}
