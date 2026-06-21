import "server-only";

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getPlatformNotificationsAction } from "@/actions/platform-overview-actions";

export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token?.sub) {
    return new Response("Unauthorized", { status: 401 });
  }

  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      getPlatformNotificationsAction()
        .then((data) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        })
        .catch(() => {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: "Failed to load notifications" })}\n\n`,
            ),
          );
        });

      const interval = setInterval(() => {
        getPlatformNotificationsAction()
          .then((data) => {
            controller.enqueue(
              encoder.encode(`event: update\ndata: ${JSON.stringify(data)}\n\n`),
            );
          })
          .catch(() => {});
      }, 30_000);

      cleanup = () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      };

      req.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
