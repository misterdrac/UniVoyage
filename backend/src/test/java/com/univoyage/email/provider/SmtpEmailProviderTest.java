package com.univoyage.email.provider;

import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.icegreen.greenmail.util.ServerSetupTest;
import com.univoyage.email.OutboundEmailMessage;
import com.univoyage.email.config.EmailProperties;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;

class SmtpEmailProviderTest {

  @RegisterExtension
  static final GreenMailExtension greenMail = new GreenMailExtension(ServerSetupTest.SMTP);

  @Test
  @DisplayName("SMTP provider sends multipart message with expected subject and body")
  void sendsMultipartEmail() throws Exception {
    JavaMailSenderImpl sender = new JavaMailSenderImpl();
    sender.setHost("127.0.0.1");
    sender.setPort(greenMail.getSmtp().getPort());
    Properties props = sender.getJavaMailProperties();
    props.put("mail.smtp.auth", "false");
    props.put("mail.smtp.starttls.enable", "false");

    EmailProperties propsConfig = new EmailProperties();
    propsConfig.setFrom("noreply@univoyage.test");
    propsConfig.setFromName("UniVoyage");

    SmtpEmailProvider provider = new SmtpEmailProvider(sender, propsConfig);
    OutboundEmailMessage message = OutboundEmailMessage.builder().to("user@example.com")
        .subject("Your UniVoyage sign-in code").textPlain("Code: 482910")
        .textHtml("<p>Code: 482910</p>").build();

    provider.send(message);

    assertThat(greenMail.waitForIncomingEmail(5000, 1)).isTrue();
    MimeMessage received = greenMail.getReceivedMessages()[0];
    assertThat(received.getSubject()).contains("sign-in");
    assertThat(GreenMailUtil.getBody(received)).contains("482910");
  }
}
