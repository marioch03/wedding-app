package com.wedding_app.backend.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import com.wedding_app.backend.modules.admin.repository.AdminUserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ClerkJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

  private final AdminUserRepository adminUserRepository;

  @Override
  public AbstractAuthenticationToken convert(Jwt jwt) {
    String clerkUserId = jwt.getSubject();
    List<GrantedAuthority> authorities = new ArrayList<>();

    // Verificamos si el usuario de Clerk está registrado como administrador en
    // nuestra BBDD
    if (adminUserRepository.existsByClerkUserId(clerkUserId)) {
      authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    return new JwtAuthenticationToken(jwt, authorities);
  }
}
