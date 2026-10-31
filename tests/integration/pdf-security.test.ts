/**
 * Protect PDF / Unlock PDF against the real qpdf WebAssembly build the site
 * ships (run in Node through tests/fixtures/qpdf-node.ts).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  ALL_ALLOWED,
  PdfSecurityError,
  inspectPdf,
  protectPdf,
  unlockPdf,
  type ProtectOptions,
} from "@/lib/pdf/security";
import { nodeQpdfRunner as run } from "../fixtures/qpdf-node";

const TITLE = "Quarterly figures for the board";

let plain: Uint8Array;

beforeAll(async () => {
  const doc = await PDFDocument.create();
  doc.setTitle(TITLE);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i += 1) doc.addPage([300, 200]).drawText(`Page ${i}`, { x: 40, y: 100, font });
  plain = await doc.save();
});

async function expectSecurityError(promise: Promise<unknown>, code: PdfSecurityError["code"]) {
  await expect(promise).rejects.toSatisfy((err: unknown) => err instanceof PdfSecurityError && err.code === code);
}

const openOnly = (pw: string): ProtectOptions => ({
  openPassword: pw,
  permissionsPassword: "",
  permissions: ALL_ALLOWED,
});

describe("inspectPdf", () => {
  it("reports an ordinary PDF as not encrypted", async () => {
    expect(await inspectPdf(run, plain)).toEqual({ kind: "not-encrypted" });
  });

  it("rejects a file that is not a PDF", async () => {
    await expectSecurityError(inspectPdf(run, new TextEncoder().encode("hello, not a pdf")), "DAMAGED");
  });
});

describe("protectPdf", () => {
  it("adds an AES-256 open password that is required to open the file", async () => {
    const { bytes, info } = await protectPdf(run, plain, openOnly("correct horse 7"));
    expect(info.revision).toBe(6);
    expect(info.bits).toBe(256);
    expect(info.method).toBe("AESv3");
    expect(await inspectPdf(run, bytes)).toEqual({ kind: "needs-password" });
    expect(await inspectPdf(run, bytes, "Correct horse 7")).toEqual({ kind: "needs-password" });
    const opened = await inspectPdf(run, bytes, "correct horse 7");
    expect(opened.kind).toBe("opened");
    // The metadata is encrypted too — pdf-lib cannot read the title any more.
    const reparsed = await PDFDocument.load(bytes, { ignoreEncryption: true });
    expect(reparsed.isEncrypted).toBe(true);
    expect(reparsed.getTitle()).not.toBe(TITLE);
  });

  it("applies exactly the requested restrictions behind a separate permissions password", async () => {
    const { bytes } = await protectPdf(run, plain, {
      openPassword: "",
      permissionsPassword: "owner-secret",
      permissions: { print: false, copy: false, edit: true },
    });
    const anonymous = await inspectPdf(run, bytes);
    expect(anonymous.kind).toBe("opened");
    if (anonymous.kind !== "opened") return;
    expect(anonymous.info.ownerPasswordMatched).toBe(false);
    expect(anonymous.info.capabilities.printhigh).toBe(false);
    expect(anonymous.info.capabilities.printlow).toBe(false);
    expect(anonymous.info.capabilities.extract).toBe(false);
    expect(anonymous.info.capabilities.modifyother).toBe(true);
    const owner = await inspectPdf(run, bytes, "owner-secret");
    expect(owner.kind === "opened" && owner.info.ownerPasswordMatched).toBe(true);
  });

  it("combines an open password with an editing restriction", async () => {
    const { bytes } = await protectPdf(run, plain, {
      openPassword: "reader-pass",
      permissionsPassword: "owner-pass",
      permissions: { print: true, copy: true, edit: false },
    });
    const reader = await inspectPdf(run, bytes, "reader-pass");
    expect(reader.kind === "opened" && reader.info.userPasswordMatched).toBe(true);
    expect(reader.kind === "opened" && reader.info.capabilities.modifyother).toBe(false);
    expect(reader.kind === "opened" && reader.info.capabilities.modifyassembly).toBe(false);
  });

  it("refuses to re-protect an already protected PDF", async () => {
    const { bytes } = await protectPdf(run, plain, openOnly("first-password"));
    await expectSecurityError(protectPdf(run, bytes, openOnly("second-password")), "ALREADY_PROTECTED");
  });

  it("accepts non-ASCII passwords, matching either Unicode normalisation form", async () => {
    const composed = "café-Ñepal-पासवर्ड";
    const decomposed = composed.normalize("NFD");
    expect(decomposed).not.toBe(composed);
    const { bytes } = await protectPdf(run, plain, openOnly(decomposed));
    expect((await inspectPdf(run, bytes, composed)).kind).toBe("opened");
    expect((await inspectPdf(run, bytes, decomposed)).kind).toBe("opened");
  });
});

describe("unlockPdf", () => {
  it("removes an open password when given that password, keeping the content", async () => {
    const { bytes: locked } = await protectPdf(run, plain, openOnly("s3cret pass"));
    const { bytes, hadOpenPassword, before } = await unlockPdf(run, locked, "s3cret pass");
    expect(hadOpenPassword).toBe(true);
    expect(before.bits).toBe(256);
    expect(await inspectPdf(run, bytes)).toEqual({ kind: "not-encrypted" });
    const doc = await PDFDocument.load(bytes);
    expect(doc.isEncrypted).toBe(false);
    expect(doc.getPageCount()).toBe(3);
    expect(doc.getTitle()).toBe(TITLE);
  });

  it("rejects a wrong password", async () => {
    const { bytes: locked } = await protectPdf(run, plain, openOnly("s3cret pass"));
    await expectSecurityError(unlockPdf(run, locked, "s3cret  pass"), "WRONG_PASSWORD");
    await expectSecurityError(unlockPdf(run, locked, ""), "WRONG_PASSWORD");
  });

  it("also accepts the permissions password for a file with an open password", async () => {
    const { bytes: locked } = await protectPdf(run, plain, {
      openPassword: "reader-pass",
      permissionsPassword: "owner-pass",
      permissions: { print: false, copy: true, edit: true },
    });
    const { bytes } = await unlockPdf(run, locked, "owner-pass");
    expect(await inspectPdf(run, bytes)).toEqual({ kind: "not-encrypted" });
  });

  it("does not lift restrictions without the permissions password", async () => {
    const { bytes: restricted } = await protectPdf(run, plain, {
      openPassword: "",
      permissionsPassword: "owner-secret",
      permissions: { print: false, copy: false, edit: false },
    });
    await expectSecurityError(unlockPdf(run, restricted, ""), "NEEDS_PERMISSIONS_PASSWORD");
    await expectSecurityError(unlockPdf(run, restricted, "guess"), "WRONG_PASSWORD");
    const { bytes, hadOpenPassword, before } = await unlockPdf(run, restricted, "owner-secret");
    expect(hadOpenPassword).toBe(false);
    expect(before.capabilities.extract).toBe(false);
    expect(await inspectPdf(run, bytes)).toEqual({ kind: "not-encrypted" });
  });

  it("unlocks an encrypted PDF that opens freely and restricts nothing without a password", async () => {
    const made = await run(
      plain,
      ["--encrypt", "--user-password=", "--owner-password=x", "--bits=256", "--", "/in.pdf", "/out.pdf"],
      true,
    );
    expect(made.output).not.toBeNull();
    const { bytes, hadOpenPassword } = await unlockPdf(run, made.output!, "");
    expect(hadOpenPassword).toBe(false);
    expect(await inspectPdf(run, bytes)).toEqual({ kind: "not-encrypted" });
  });

  it("says so when the PDF is not protected at all", async () => {
    await expectSecurityError(unlockPdf(run, plain, "anything"), "NOT_PROTECTED");
  });

  it("unlocks legacy RC4 and AES-128 files made by older software", async () => {
    for (const extra of [["--bits=40"], ["--bits=128"], ["--bits=128", "--use-aes=y"]]) {
      const made = await run(
        plain,
        [
          "--allow-weak-crypto",
          "--encrypt",
          "--user-password=old",
          "--owner-password=older",
          ...extra,
          "--",
          "/in.pdf",
          "/out.pdf",
        ],
        true,
      );
      expect(made.output).not.toBeNull();
      const { bytes, before } = await unlockPdf(run, made.output!, "old");
      expect(before.revision).toBeLessThan(6);
      expect((await PDFDocument.load(bytes)).getPageCount()).toBe(3);
    }
  });
});
