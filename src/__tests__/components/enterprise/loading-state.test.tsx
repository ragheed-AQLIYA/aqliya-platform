import { describe, it, expect } from "@jest/globals"
import { render, screen } from "@testing-library/react"

describe("LoadingState", () => {
  it("should render spinner", async () => {
    const { LoadingState } = await import("@/components/enterprise/loading-state")
    const { container } = render(<LoadingState />)
    const spinner = container.querySelector(".animate-spin")
    expect(spinner).toBeTruthy()
  })
})
