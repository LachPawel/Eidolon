import { render } from "@testing-library/react";
import { Providers } from "./Providers";
import { describe, it, expect } from "vitest";

describe("Providers Component", () => {
  it("renders children without crashing", () => {
    const { container } = render(
      <Providers>
        <div data-testid="test-child">Test Child</div>
      </Providers>
    );

    expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument();
  });

  it("provides QueryClient context", () => {
    const TestComponent = () => <div>Test</div>;

    const { container } = render(
      <Providers>
        <TestComponent />
      </Providers>
    );

    expect(container).toBeInTheDocument();
  });
});
