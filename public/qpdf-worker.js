/* GlassTools qpdf worker — runs qpdf (WebAssembly) off the main thread.
 *
 * Message in:  { id, input: ArrayBuffer, args: string[], wantOutput: boolean }
 * Message out: { id, code, stdout, stderr, output: ArrayBuffer | null }
 *            | { id, fatal: string }
 *
 * The PDF only ever lives in this worker's memory (Emscripten's in-memory
 * file system). Nothing is sent over the network: the only requests this
 * worker makes are for /qpdf/qpdf.js and /qpdf/qpdf.wasm on this origin.
 * A fresh qpdf instance is created for every job, so no state (or password)
 * survives from one job to the next.
 */
/* eslint-disable */
"use strict";

importScripts("/qpdf/qpdf.js");

const INPUT = "/in.pdf";
const OUTPUT = "/out.pdf";

self.onmessage = async (event) => {
  const { id, input, args, wantOutput } = event.data || {};
  const stdout = [];
  const stderr = [];
  // qpdf.js binds console.log / console.error when the instance is created,
  // so route them into buffers for the duration of the instantiation.
  const realLog = console.log;
  const realError = console.error;
  console.log = (line) => stdout.push(String(line));
  console.error = (line) => stderr.push(String(line));
  try {
    // The instance keeps the bound copies, so later output still lands in the buffers.
    const qpdf = await Module({ locateFile: () => "/qpdf/qpdf.wasm", noInitialRun: true });
    qpdf.FS.writeFile(INPUT, new Uint8Array(input));
    let code;
    try {
      code = qpdf.callMain(args);
    } catch (err) {
      code = err && typeof err.status === "number" ? err.status : 2;
      if (!(err && typeof err.status === "number")) stderr.push(String(err && err.message ? err.message : err));
    }
    let output = null;
    if (wantOutput && (code === 0 || code === 3)) {
      try {
        const bytes = qpdf.FS.readFile(OUTPUT);
        output = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      } catch (_) {
        output = null;
      }
    }
    console.log = realLog;
    console.error = realError;
    self.postMessage(
      { id, code, stdout: stdout.join("\n"), stderr: stderr.join("\n"), output },
      output ? [output] : [],
    );
  } catch (err) {
    console.log = realLog;
    console.error = realError;
    self.postMessage({ id, fatal: String(err && err.message ? err.message : err) });
  }
};
