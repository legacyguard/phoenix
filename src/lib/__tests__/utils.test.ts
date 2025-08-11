import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn function", () => {
    it("combines class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      const shouldInclude = false;
      const shouldExclude = true;
      expect(cn("base", shouldInclude ? "conditional" : "", "final")).toBe(
        "base final",
      );
      expect(cn("base", shouldExclude ? "conditional" : "", "final")).toBe(
        "base conditional final",
      );
    });

    it("merges Tailwind classes correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("handles undefined and null values", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("handles arrays", () => {
      expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
    });

    it("handles objects", () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
    });
  });
});
