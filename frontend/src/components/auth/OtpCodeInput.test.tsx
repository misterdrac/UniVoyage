import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpCodeInput } from "./OtpCodeInput";
import { emptyOtpDigits, OTP_CODE_LENGTH } from "./otpCode";

function OtpHarness({ onSubmit = vi.fn() }: { onSubmit?: () => void }) {
  const [digits, setDigits] = React.useState(emptyOtpDigits());
  const code = digits.join("");
  const isValid = new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p id="otp-help">Enter the email verification code.</p>
      <OtpCodeInput
        value={digits}
        onChange={setDigits}
        ariaDescribedBy="otp-help"
      />
      <button type="submit" disabled={!isValid}>
        Submit code
      </button>
    </form>
  );
}

function getDigit(index: number) {
  return screen.getByLabelText(`Digit ${index} of 6`) as HTMLInputElement;
}

describe("OtpCodeInput", () => {
  it("fills all six inputs when a full code is pasted", async () => {
    const user = userEvent.setup();
    render(<OtpHarness />);

    await user.click(getDigit(1));
    await user.paste("123456");

    expect(getDigit(1)).toHaveValue("1");
    expect(getDigit(2)).toHaveValue("2");
    expect(getDigit(3)).toHaveValue("3");
    expect(getDigit(4)).toHaveValue("4");
    expect(getDigit(5)).toHaveValue("5");
    expect(getDigit(6)).toHaveValue("6");
    expect(screen.getByRole("button", { name: /submit code/i })).toBeEnabled();
  });

  it("moves backward and clears the previous digit on backspace", async () => {
    const user = userEvent.setup();
    render(<OtpHarness />);

    await user.click(getDigit(1));
    await user.keyboard("12");
    await user.keyboard("{Backspace}");

    expect(getDigit(1)).toHaveValue("1");
    expect(getDigit(2)).toHaveValue("");
    expect(getDigit(2)).toHaveFocus();
  });

  it("keeps submit disabled until the code has six digits", async () => {
    const user = userEvent.setup();
    render(<OtpHarness />);

    expect(screen.getByRole("button", { name: /submit code/i })).toBeDisabled();

    await user.click(getDigit(1));
    await user.paste("12345");

    expect(getDigit(5)).toHaveValue("5");
    expect(getDigit(6)).toHaveValue("");
    expect(screen.getByRole("button", { name: /submit code/i })).toBeDisabled();
  });
});
