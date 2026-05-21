import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { RetryAfterNotice } from "./RetryAfterNotice";

describe("RetryAfterNotice", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats retry time in minutes", () => {
    render(
      <RetryAfterNotice retryAfterSeconds={75} message="Too many attempts." />,
    );

    expect(
      screen.getByText(/too many attempts\. try again in 2 min\./i),
    ).toBeInTheDocument();
  });

  it("calls onElapsed when the countdown reaches zero", async () => {
    vi.useFakeTimers();
    const onElapsed = vi.fn();

    render(
      <RetryAfterNotice
        retryAfterSeconds={2}
        message="Too many attempts."
        onElapsed={onElapsed}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(onElapsed).toHaveBeenCalledTimes(1);
  });
});
