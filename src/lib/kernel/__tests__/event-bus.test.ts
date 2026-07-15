import { EventBusWrapper } from "../implementations/event-bus";
import type { DomainEvent, EventHandler } from "../contracts/event-bus";

function makeEvent(overrides: Partial<Omit<DomainEvent, "schemaVersion" | "occurredAt">> = {}): Omit<DomainEvent, "schemaVersion" | "occurredAt"> {
  return {
    productSlug: "test",
    domain: "audit",
    action: "test.action",
    correlationId: "corr-1",
    ...overrides,
  };
}

describe("EventBusWrapper", () => {
  let bus: EventBusWrapper;

  beforeEach(() => {
    bus = new EventBusWrapper();
  });

  test("publish invokes exact handler", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "test.action", handler);

    await bus.publish(makeEvent());

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as DomainEvent;
    expect(event.schemaVersion).toBe("1.0");
    expect(event.occurredAt).toBeDefined();
    expect(event.domain).toBe("audit");
    expect(event.action).toBe("test.action");
  });

  test("publish invokes wildcard handler for domain", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "*", handler);

    await bus.publish(makeEvent({ action: "engagement.created" }));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].action).toBe("engagement.created");
  });

  test("publish invokes both exact and wildcard handlers", async () => {
    const exact = jest.fn().mockResolvedValue(undefined);
    const wildcard = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "test.action", exact);
    bus.subscribe("audit", "*", wildcard);

    await bus.publish(makeEvent());

    expect(exact).toHaveBeenCalledTimes(1);
    expect(wildcard).toHaveBeenCalledTimes(1);
  });

  test("publish does not invoke handlers for other domains", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("workflow", "test.action", handler);

    await bus.publish(makeEvent());

    expect(handler).not.toHaveBeenCalled();
  });

  test("unsubscribe removes handler", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "test.action", handler);
    bus.unsubscribe("audit", "test.action", handler);

    await bus.publish(makeEvent());

    expect(handler).not.toHaveBeenCalled();
  });

  test("handler error is caught and added to dead letter queue", async () => {
    const failingHandler = jest.fn().mockRejectedValue(new Error("handler failed"));
    bus.subscribe("audit", "test.action", failingHandler);

    await bus.publish(makeEvent());

    const deadLetters = await bus.getDeadLetters();
    expect(deadLetters.success).toBe(true);
    expect(deadLetters.data).toHaveLength(1);
    expect(deadLetters.data![0].error).toBe("handler failed");
    expect(deadLetters.data![0].event.action).toBe("test.action");
  });

  test("handler retry succeeds on second attempt", async () => {
    let callCount = 0;
    const retryHandler = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) throw new Error("first attempt failed");
    });
    bus.subscribe("audit", "test.action", retryHandler);

    await bus.publish(makeEvent());

    expect(retryHandler).toHaveBeenCalledTimes(2);
    const deadLetters = await bus.getDeadLetters();
    expect(deadLetters.data).toHaveLength(0);
  });

  test("handler retry exhausted goes to dead letter", async () => {
    const alwaysFails = jest.fn().mockRejectedValue(new Error("always fails"));
    bus.subscribe("audit", "test.action", alwaysFails);

    await bus.publish(makeEvent());

    expect(alwaysFails).toHaveBeenCalledTimes(3);
    const deadLetters = await bus.getDeadLetters();
    expect(deadLetters.data).toHaveLength(1);
  });

  test("replay returns events by correlationId", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "*", handler);

    await bus.publish(makeEvent({ correlationId: "corr-aaa" }));
    await bus.publish(makeEvent({ correlationId: "corr-bbb" }));
    await bus.publish(makeEvent({ correlationId: "corr-aaa" }));

    const result = await bus.replay("corr-aaa");
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data![0].correlationId).toBe("corr-aaa");
    expect(result.data![1].correlationId).toBe("corr-aaa");
  });

  test("retryDeadLetter retries the failed event", async () => {
    let shouldFail = true;
    const flakyHandler = jest.fn().mockImplementation(async () => {
      if (shouldFail) throw new Error("flaky");
    });
    bus.subscribe("audit", "test.action", flakyHandler);

    await bus.publish(makeEvent());
    const deadLetters = await bus.getDeadLetters();
    expect(deadLetters.data).toHaveLength(1);

    shouldFail = false;
    await bus.retryDeadLetter(deadLetters.data![0]);

    const afterRetry = await bus.getDeadLetters();
    expect(afterRetry.data).toHaveLength(0);
  });

  test("clearDeadLetters empties the queue", async () => {
    const handler = jest.fn().mockRejectedValue(new Error("fail"));
    bus.subscribe("audit", "test.action", handler);

    await bus.publish(makeEvent());
    expect((await bus.getDeadLetters()).data).toHaveLength(1);

    await bus.clearDeadLetters();
    expect((await bus.getDeadLetters()).data).toHaveLength(0);
  });

  test("getHistory returns published events", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "*", handler);

    await bus.publish(makeEvent({ action: "a1" }));
    await bus.publish(makeEvent({ action: "a2" }));

    const history = await bus.getHistory();
    expect(history.success).toBe(true);
    expect(history.data).toHaveLength(2);
    expect(history.data![0].event.action).toBe("a1");
    expect(history.data![1].event.action).toBe("a2");
    expect(history.data![0].succeeded).toBe(1);
    expect(history.data![0].failed).toBe(0);
  });

  test("getHistory respects limit", async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "*", handler);

    await bus.publish(makeEvent({ action: "a1" }));
    await bus.publish(makeEvent({ action: "a2" }));
    await bus.publish(makeEvent({ action: "a3" }));

    const history = await bus.getHistory(2);
    expect(history.data).toHaveLength(2);
    expect(history.data![0].event.action).toBe("a2");
    expect(history.data![1].event.action).toBe("a3");
  });

  test("getHandlerCount returns total handlers", () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    bus.subscribe("audit", "a", h1);
    bus.subscribe("audit", "b", h2);
    bus.subscribe("workflow", "a", h1);

    expect(bus.getHandlerCount()).toBe(3);
  });

  test("publish sets schemaVersion and occurredAt on event", async () => {
    let capturedEvent: DomainEvent | null = null;
    bus.subscribe("audit", "test.action", async (e) => {
      capturedEvent = e;
    });

    await bus.publish(makeEvent());

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent!.schemaVersion).toBe("1.0");
    expect(capturedEvent!.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("history tracks failed handler count", async () => {
    const failingHandler = jest.fn().mockRejectedValue(new Error("fail"));
    const successHandler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe("audit", "test.action", failingHandler);
    bus.subscribe("audit", "test.action", successHandler);

    await bus.publish(makeEvent());

    const history = await bus.getHistory();
    expect(history.data![0].handlerCount).toBe(2);
    expect(history.data![0].succeeded).toBe(1);
    expect(history.data![0].failed).toBe(1);
  });
});
