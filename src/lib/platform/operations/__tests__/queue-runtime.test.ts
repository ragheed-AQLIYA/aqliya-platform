import { registerHandler, enqueueTask, getJobStatus } from "../queue-runtime"

describe("Queue Runtime — Failure Test", () => {
  beforeEach(() => {
    process.env.FF_QUEUE_ENABLED = "false"
  })

  it("rejects duplicate handler registration", () => {
    const handler = async () => {}
    registerHandler("test_type", handler)
    expect(() => registerHandler("test_type", handler)).toThrow(
      "Handler already registered for queue type: test_type",
    )
  })

  it("returns fake job ID when queue is disabled", async () => {
    const id = await enqueueTask("output_queue", { some: "data" })
    expect(id).toMatch(/^queue-\d+-[a-z0-9]+$/)
  })

  it("returns fake completed status when queue is disabled", async () => {
    const result = await getJobStatus("fake-job-123")
    expect(result).not.toBeNull()
    expect(result!.status).toBe("completed")
  })
})
