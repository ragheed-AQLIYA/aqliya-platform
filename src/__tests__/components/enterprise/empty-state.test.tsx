import { describe, it, expect } from "@jest/globals"
import { render, screen } from "@testing-library/react"

describe("EmptyState", () => {
  it("should render with default props", async () => {
    const { EmptyState } = await import("@/components/enterprise/empty-state")
    const { container } = render(<EmptyState title="Test Title" description="Test Description" />)
    expect(container.textContent).toContain("Test Title")
  })
})
