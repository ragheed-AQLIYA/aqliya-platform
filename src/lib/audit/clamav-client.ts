import "server-only";

import net from "node:net";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 3310;
const CHUNK_SIZE = 64 * 1024;

export interface ClamAvScanResult {
  ok: boolean;
  infected: boolean;
  message: string;
}

function getClamAvEndpoint(): { host: string; port: number } {
  return {
    host: process.env.CLAMAV_HOST ?? DEFAULT_HOST,
    port: Number(process.env.CLAMAV_PORT ?? DEFAULT_PORT),
  };
}

function sendClamAvCommand(
  command: Buffer,
  payload?: Buffer,
): Promise<string> {
  const { host, port } = getClamAvEndpoint();

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    let response = "";

    socket.setTimeout(30_000);

    socket.on("data", (chunk) => {
      response += chunk.toString("utf8");
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error(`ClamAV timeout connecting to ${host}:${port}`));
    });

    socket.on("error", (error) => {
      reject(error);
    });

    socket.on("close", () => {
      resolve(response.trim());
    });

    socket.write(command);
    if (payload) {
      socket.write(payload);
    }
    socket.end();
  });
}

export async function pingClamAv(): Promise<ClamAvScanResult> {
  try {
    const response = await sendClamAvCommand(Buffer.from("zPING\0"));
    const ok = response.includes("PONG");
    return {
      ok,
      infected: false,
      message: ok ? "ClamAV PONG" : `Unexpected ClamAV ping response: ${response}`,
    };
  } catch (error) {
    return {
      ok: false,
      infected: false,
      message:
        error instanceof Error
          ? error.message
          : "ClamAV ping failed",
    };
  }
}

export async function scanBufferWithClamAv(
  content: Buffer,
): Promise<ClamAvScanResult> {
  try {
    const chunks: Buffer[] = [Buffer.from("zINSTREAM\0")];

    for (let offset = 0; offset < content.length; offset += CHUNK_SIZE) {
      const chunk = content.subarray(offset, offset + CHUNK_SIZE);
      const size = Buffer.alloc(4);
      size.writeUInt32BE(chunk.length, 0);
      chunks.push(size, chunk);
    }

    chunks.push(Buffer.alloc(4)); // zero-length chunk terminates stream

    const response = await sendClamAvCommand(
      Buffer.concat(chunks.slice(0, 1)),
      Buffer.concat(chunks.slice(1)),
    );

    if (response.includes("FOUND")) {
      return {
        ok: true,
        infected: true,
        message: response,
      };
    }

    if (response.includes("OK")) {
      return {
        ok: true,
        infected: false,
        message: response,
      };
    }

    return {
      ok: false,
      infected: false,
      message: `Unexpected ClamAV scan response: ${response}`,
    };
  } catch (error) {
    return {
      ok: false,
      infected: false,
      message:
        error instanceof Error
          ? error.message
          : "ClamAV scan failed",
    };
  }
}
