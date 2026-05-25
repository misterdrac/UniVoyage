-- Extend OTP purpose enum to support admin 2FA challenges.
ALTER TABLE email_otp_challenges
    DROP CONSTRAINT IF EXISTS email_otp_purpose_check;

ALTER TABLE email_otp_challenges
    ADD CONSTRAINT email_otp_purpose_check
    CHECK (purpose IN ('LOGIN', 'REGISTER', 'PASSWORD_RESET', 'ADMIN_LOGIN'));
