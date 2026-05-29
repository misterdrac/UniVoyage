package com.univoyage.auth.exception;

/**
 * Thrown when an attempt is made to create an identity that already exists for
 * the given (provider, providerSubject) pair.
 */
public class IdentityAlreadyLinkedException extends RuntimeException {

  public IdentityAlreadyLinkedException(String provider, String providerSubject) {
    super("Identity already linked: provider=" + provider + " subject=" + providerSubject);
  }
}
