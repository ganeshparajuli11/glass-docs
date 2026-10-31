/**
 * Runs the same qpdf WebAssembly build the site ships, but in Node, behind the
 * QpdfRunner interface used by src/lib/pdf/security.ts. Mirrors
 * public/qpdf-worker.js: a fresh instance per call, console output captured.
 */
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { QPDF_INPUT, QPDF_OUTPUT, type QpdfRun, type QpdfRunner } from "@/lib/pdf/security";

const require = createRequire(import.meta.url);
const pkgJson = require.resolve("@neslinesli93/qpdf-wasm/package.json");
const wasmPath = join(dirname(pkgJson), "dist", "qpdf.wasm");

interface QpdfInstance {
  callMain(args: string[]): number;
  FS: { writeFile(path: string, data: Uint8Array): void; readFile(path: string): Uint8Array };
}
type Factory = (opts: Record<string, unknown>) => Promise<QpdfInstance>;
const createModule = require("@neslinesli93/qpdf-wasm") as Factory;

/** Every argument list qpdf was called with, for assertions. */
export const qpdfCalls: string[][] = [];

export const nodeQpdfRunner: QpdfRunner = async (input, args, wantOutput): Promise<QpdfRun> => {
  qpdfCalls.push(args);
  const stdout: string[] = [];
  const stderr: string[] = [];
  const realLog = console.log;
  const realError = console.error;
  console.log = (line: unknown) => stdout.push(String(line));
  console.error = (line: unknown) => stderr.push(String(line));
  try {
    const qpdf = await createModule({ locateFile: () => wasmPath, noInitialRun: true });
    qpdf.FS.writeFile(QPDF_INPUT, input);
    let code: number;
    try {
      code = qpdf.callMain(args);
    } catch (err) {
      code = typeof (err as { status?: unknown }).status === "number" ? (err as { status: number }).status : 2;
    }
    let output: Uint8Array | null = null;
    if (wantOutput && (code === 0 || code === 3)) {
      try {
        output = new Uint8Array(qpdf.FS.readFile(QPDF_OUTPUT));
      } catch {
        output = null;
      }
    }
    return { code, stdout: stdout.join("\n"), stderr: stderr.join("\n"), output };
  } finally {
    console.log = realLog;
    console.error = realError;
    // Emscripten sets process.exitCode on a non-zero exit; keep the test run clean.
    process.exitCode = 0;
  }
};
