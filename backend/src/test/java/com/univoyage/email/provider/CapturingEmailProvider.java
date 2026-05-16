package com.univoyage.email.provider;

import com.univoyage.email.OutboundEmailMessage;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Test double that records sent messages without network I/O. */
public class CapturingEmailProvider implements EmailProvider {

  private final List<OutboundEmailMessage> sent = Collections.synchronizedList(new ArrayList<>());

  @Override
  public void send(OutboundEmailMessage message) {
    sent.add(message);
  }

  public List<OutboundEmailMessage> getSent() {
    return List.copyOf(sent);
  }

  public void clear() {
    sent.clear();
  }
}
