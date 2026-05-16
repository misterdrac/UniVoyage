package com.univoyage.exception;

import com.univoyage.auth.exception.IdentityAlreadyLinkedException;
import com.univoyage.common.response.ApiResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerIdentityAlreadyLinkedTest {

  private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

  @Test
  void identityAlreadyLinked_mapsTo409WithMessage() {
    var ex = new IdentityAlreadyLinkedException("google", "sub-abc");
    var request = new ServletWebRequest(new MockHttpServletRequest());

    ResponseEntity<ApiResponse<Object>> response = handler.handleIdentityAlreadyLinkedException(ex,
        request);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().isSuccess()).isFalse();
    assertThat(response.getBody().getError()).contains("google").contains("sub-abc");
  }
}
