"use client";

/**
 * Browser runner for qpdf (WebAssembly) — see public/qpdf-worker.js.
 * Each call starts a dedicated worker and ends it afterwards, so the PDF and
 * any password are dropped from memory as soon as the job finishes.
 */
import type { QpdfRun, QpdfRunner } from "./security";

export const QPDF_WORKER_URL = "/qpdf-worker.js";

interface WorkerReply {
  id: number;
  code?: number;
  stdout?: string;
  stderr?: string;
  output?: ArrayBuffer | null;
  fatal?: string;
}

let nextId = 1;

export const browserQpdfRunner: QpdfRunner = (input, args, wantOutput) =>
  new Promise<QpdfRun>((resolve, reject) => {
    if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") {
      reject(new Error("BROWSER_UNSUPPORTED"));
      return;
    }
    const id = nextId++;
    const worker = new Worker(QPDF_WORKER_URL);
    const finish = () => worker.terminate();
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      const reply = event.data;
      if (reply.id !== id) return;
      finish();
      if (reply.fatal !== undefined) {
        reject(new Error(reply.fatal));
        return;
      }
      resolve({
        code: reply.code ?? 2,
        stdout: reply.stdout ?? "",
        stderr: reply.stderr ?? "",
        output: reply.output ? new Uint8Array(reply.output) : null,
      });
    };
    worker.onerror = (event) => {
      finish();
      reject(new Error(event.message || "qpdf worker failed to start"));
    };
    // Copy the input so the caller's bytes stay usable after the transfer.
    const copy = input.slice().buffer;
    worker.postMessage({ id, input: copy, args, wantOutput }, [copy]);
  });
