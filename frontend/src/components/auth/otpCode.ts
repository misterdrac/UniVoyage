export const OTP_CODE_LENGTH = 6;

export const emptyOtpDigits = () =>
  Array.from({ length: OTP_CODE_LENGTH }, () => "");
