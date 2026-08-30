import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AnimatedCounter } from "./AnimatedCounter";
import { TactileButton } from "./TactileButton";

describe("AnimatedCounter component", () => {
  it("renders initial value formatted properly", () => {
    render(<AnimatedCounter value={12500} prefix="฿" />);
    expect(screen.getByText(/12,500/)).toBeDefined();
  });

  it("handles negative numbers correctly with prefix", () => {
    render(<AnimatedCounter value={-3400} prefix="฿" />);
    expect(screen.getByText(/-฿3,400/)).toBeDefined();
  });

  it("renders suffix correctly", () => {
    render(<AnimatedCounter value={85} suffix="%" />);
    expect(screen.getByText(/85%/)).toBeDefined();
  });
});

describe("TactileButton component", () => {
  it("renders children and handles clicks", () => {
    let clicked = false;
    render(
      <TactileButton onClick={() => { clicked = true; }}>
        Click Me
      </TactileButton>
    );

    const button = screen.getByRole("button", { name: /Click Me/i });
    button.click();
    expect(clicked).toBe(true);
  });
});
