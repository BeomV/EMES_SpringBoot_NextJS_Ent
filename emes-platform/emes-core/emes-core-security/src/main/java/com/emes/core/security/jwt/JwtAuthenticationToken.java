package com.emes.core.security.jwt;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Collectors;

/**
 * JWT Authentication Token
 */
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final String principal;
    private String credentials;

    public JwtAuthenticationToken(String principal, String authorities) {
        super(parseAuthorities(authorities));
        this.principal = principal;
        this.credentials = null;
        setAuthenticated(true);
    }

    private static Collection<? extends GrantedAuthority> parseAuthorities(String authorities) {
        if (authorities == null || authorities.isEmpty()) {
            return Arrays.asList();
        }
        return Arrays.stream(authorities.split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @Override
    public Object getCredentials() {
        return credentials;
    }

    @Override
    public Object getPrincipal() {
        return principal;
    }
}
