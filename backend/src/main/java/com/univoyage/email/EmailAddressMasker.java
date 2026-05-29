package com.univoyage.email;

public final class EmailAddressMasker {

  private EmailAddressMasker() {
  }

  public static String mask(String email) {
    if (email == null || email.isBlank()) {
      return "***";
    }
    int at = email.indexOf('@');
    if (at <= 1) {
      return "***";
    }
    return email.charAt(0) + "***" + email.substring(at);
  }
}
