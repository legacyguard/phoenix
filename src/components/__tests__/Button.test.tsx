import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled button</Button>);
    const button = screen.getByText("Disabled button");
    expect(button).toBeDisabled();
  });

  it("applies variant classes", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByText("Delete")).toHaveClass("bg-danger");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText("Outline")).toHaveClass("border-primary");
  });
});
