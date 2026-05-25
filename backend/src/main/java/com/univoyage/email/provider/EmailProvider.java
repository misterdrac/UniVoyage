package com.univoyage.email.provider;

import com.univoyage.email.OutboundEmailMessage;

/** Sends a fully rendered outbound email. */
public interface EmailProvider {

  void send(OutboundEmailMessage message);
}
