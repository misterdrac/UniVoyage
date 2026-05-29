package com.univoyage.auth.validation;

import java.util.regex.Pattern;

/** Matches frontend password-strength rules (8+ chars, upper, lower, digit). */
public final class PasswordPolicy {

  private static final int MIN_LENGTH = 8;
  private static final Pattern UPPER = Pattern.compile("[A-Z]");
  private static final Pattern LOWER = Pattern.compile("[a-z]");
  private static final Pattern DIGIT = Pattern.compile("\\d");

  private PasswordPolicy() {
  }

  public static boolean isValid(String password) {
    if (password == null || password.length() < MIN_LENGTH) {
      return false;
    }
    return UPPER.matcher(password).find() && LOWER.matcher(password).find()
        && DIGIT.matcher(password).find();
  }

  public static String requirementMessage() {
    return "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
  }
}
