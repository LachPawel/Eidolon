import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DisplayCard, DisplayCards } from "./DisplayCards";
import { Box } from "lucide-react";

describe("DisplayCard", () => {
  it("renders with default props", () => {
    render(<DisplayCard />);

    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Discover amazing content")).toBeInTheDocument();
    expect(screen.getByText("Just now")).toBeInTheDocument();
  });

  it("renders with custom props", () => {
    render(
      <DisplayCard
        title="Test Title"
        description="Test Description"
        date="Yesterday"
        icon={<Box className="size-4 text-zinc-700" />}
      />
    );

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("renders AI hint when provided", () => {
    render(<DisplayCard title="Test" description="Description" aiHint="This is an AI hint" />);

    expect(screen.getByText("This is an AI hint")).toBeInTheDocument();
    expect(screen.getByText("Eidolon AI")).toBeInTheDocument();
  });

  it("does not render AI hint when not provided", () => {
    render(<DisplayCard title="Test" description="Description" />);

    expect(screen.queryByText("Eidolon AI")).not.toBeInTheDocument();
  });
});

describe("DisplayCards", () => {
  it("renders multiple cards", () => {
    const cards = [
      { title: "Card 1", description: "Description 1", date: "Date 1" },
      { title: "Card 2", description: "Description 2", date: "Date 2" },
      { title: "Card 3", description: "Description 3", date: "Date 3" },
    ];

    render(<DisplayCards cards={cards} />);

    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
    expect(screen.getByText("Card 3")).toBeInTheDocument();
  });

  it("renders empty state when no cards", () => {
    const { container } = render(<DisplayCards cards={[]} />);

    const cards = container.querySelectorAll('[class*="DisplayCard"]');
    expect(cards.length).toBe(0);
  });
});
