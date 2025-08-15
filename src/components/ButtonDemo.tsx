import { Button } from "./ui/Button"

/**
 * Demo komponent pre testovanie Button variantov
 * Zobrazuje všetky varianty a veľkosti tlačidiel v našom dizajn systéme
 */
export function ButtonDemo() {
  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Varianty */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      {/* Veľkosti */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Button Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Disabled stavy */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Disabled States</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled Default</Button>
          <Button variant="secondary" disabled>
            Disabled Secondary
          </Button>
          <Button variant="outline" disabled>
            Disabled Outline
          </Button>
        </div>
      </div>

      {/* Kombinované príklady */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Real-world Examples</h2>
        <div className="flex flex-wrap gap-4">
          <Button size="lg" className="font-bold">
            Get Started
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
          <Button variant="ghost" className="text-muted-foreground">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
