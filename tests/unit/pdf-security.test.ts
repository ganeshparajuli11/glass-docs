import { describe, expect, it } from "vitest";
import {
  ALL_ALLOWED,
  MAX_PASSWORD_BYTES,
  buildInspectArgs,
  buildProtectArgs,
  buildUnlockArgs,
  classifyQpdfFailure,
  describeEncryption,
  describeRestrictions,
  parseEncryptJson,
  passwordCandidates,
  validateProtectInput,
  type Capabilities,
  type ProtectFormInput,
} from "@/lib/pdf/security";

const form = (over: Partial<ProtectFormInput> = {}): ProtectFormInput => ({
  requireOpenPassword: true,
  openPassword: "long enough pw",
  confirmOpenPassword: "long enough pw",
  permissionsPassword: "",
  permissions: ALL_ALLOWED,
  ...over,
});

describe("validateProtectInput", () => {
  it("accepts a matching open password", () => {
    expect(validateProtectInput(form())).toEqual({ errors: [], warnings: [] });
  });

  it("requires the password and its confirmation to match", () => {
    expect(validateProtectInput(form({ confirmOpenPassword: "long enough pW" })).errors).toEqual([
      "The two passwords do not match.",
    ]);
    expect(validateProtectInput(form({ openPassword: "", confirmOpenPassword: "" })).errors).toHaveLength(1);
  });

  it("warns about, but allows, short passwords", () => {
    const r = validateProtectInput(form({ openPassword: "abc", confirmOpenPassword: "abc" }));
    expect(r.errors).toEqual([]);
    expect(r.warnings).toHaveLength(1);
  });

  it("rejects passwords longer than PDF readers use", () => {
    const pw = "a".repeat(MAX_PASSWORD_BYTES + 1);
    expect(validateProtectInput(form({ openPassword: pw, confirmOpenPassword: pw })).errors[0]).toMatch(/too long/);
    // Multi-byte characters count by UTF-8 bytes, not characters.
    const nepali = "क".repeat(43); // 3 bytes each = 129
    expect(validateProtectInput(form({ openPassword: nepali, confirmOpenPassword: nepali })).errors[0]).toMatch(
      /too long/,
    );
  });

  it("needs something to protect", () => {
    expect(validateProtectInput(form({ requireOpenPassword: false })).errors[0]).toMatch(/nothing to protect/);
  });

  it("requires a distinct permissions password for restrictions", () => {
    const restricted = { print: false, copy: true, edit: true };
    expect(validateProtectInput(form({ permissions: restricted })).errors[0]).toMatch(/permissions password/);
    expect(
      validateProtectInput(form({ permissions: restricted, permissionsPassword: "long enough pw" })).errors[0],
    ).toMatch(/different/);
    expect(validateProtectInput(form({ permissions: restricted, permissionsPassword: "other" })).errors).toEqual([]);
    expect(
      validateProtectInput(
        form({
          requireOpenPassword: false,
          openPassword: "",
          confirmOpenPassword: "",
          permissions: restricted,
          permissionsPassword: "o",
        }),
      ).errors,
    ).toEqual([]);
  });
});

describe("qpdf command lines", () => {
  it("uses AES-256 and the open password as owner password when nothing is restricted", () => {
    expect(buildProtectArgs({ openPassword: "pw", permissionsPassword: "ignored", permissions: ALL_ALLOWED })).toEqual([
      "--encrypt",
      "--user-password=pw",
      "--owner-password=pw",
      "--bits=256",
      "--",
      "/in.pdf",
      "/out.pdf",
    ]);
  });

  it("maps each restriction to its qpdf flag", () => {
    const args = buildProtectArgs({
      openPassword: "",
      permissionsPassword: "own",
      permissions: { print: false, copy: false, edit: false },
    });
    expect(args).toContain("--user-password=");
    expect(args).toContain("--owner-password=own");
    expect(args).toContain("--print=none");
    expect(args).toContain("--extract=n");
    expect(args).toContain("--modify=none");
    expect(args.slice(-3)).toEqual(["--", "/in.pdf", "/out.pdf"]);
  });

  it("keeps passwords that look like options or response files inside one argument", () => {
    const args = buildProtectArgs({ openPassword: "@--decrypt x", permissionsPassword: "", permissions: ALL_ALLOWED });
    expect(args[1]).toBe("--user-password=@--decrypt x");
    expect(buildUnlockArgs("@file")).toEqual(["--password=@file", "--decrypt", "/in.pdf", "/out.pdf"]);
  });

  it("normalises new passwords to NFKC", () => {
    const args = buildProtectArgs({ openPassword: "é", permissionsPassword: "", permissions: ALL_ALLOWED });
    expect(args[1]).toBe("--user-password=é");
  });

  it("builds inspect commands with and without a password", () => {
    expect(buildInspectArgs()).toEqual(["--json=2", "--json-key=encrypt", "/in.pdf"]);
    expect(buildInspectArgs("")).toEqual(["--password=", "--json=2", "--json-key=encrypt", "/in.pdf"]);
  });
});

describe("passwordCandidates", () => {
  it("adds the NFKC form only when it differs", () => {
    expect(passwordCandidates("plain")).toEqual(["plain"]);
    expect(passwordCandidates("é")).toEqual(["é", "é"]);
  });
});

const sample = {
  version: 2,
  encrypt: {
    capabilities: {
      accessibility: true,
      extract: false,
      modify: true,
      modifyannotations: true,
      modifyassembly: true,
      modifyforms: true,
      modifyother: true,
      printhigh: false,
      printlow: false,
    },
    encrypted: true,
    ownerpasswordmatched: false,
    parameters: { P: -2072, R: 6, V: 5, bits: 256, method: "AESv3" },
    userpasswordmatched: true,
  },
};

describe("parseEncryptJson", () => {
  it("reads qpdf's encrypt JSON", () => {
    const info = parseEncryptJson(JSON.stringify(sample));
    expect(info).toMatchObject({
      encrypted: true,
      userPasswordMatched: true,
      ownerPasswordMatched: false,
      revision: 6,
      bits: 256,
      method: "AESv3",
    });
    expect(info?.capabilities.extract).toBe(false);
  });

  it("treats an unencrypted file as having every capability", () => {
    const info = parseEncryptJson(JSON.stringify({ encrypt: { encrypted: false, capabilities: { extract: false } } }));
    expect(info?.encrypted).toBe(false);
    expect(info?.capabilities.extract).toBe(true);
    expect(info?.revision).toBeNull();
  });

  it("returns null for anything else", () => {
    expect(parseEncryptJson("")).toBeNull();
    expect(parseEncryptJson("not json")).toBeNull();
    expect(parseEncryptJson("{}")).toBeNull();
    expect(parseEncryptJson("null")).toBeNull();
  });
});

describe("descriptions", () => {
  const caps = (over: Partial<Capabilities>): Capabilities => ({
    ...parseEncryptJson(JSON.stringify(sample))!.capabilities,
    ...over,
  });

  it("lists restrictions in plain language", () => {
    expect(describeRestrictions(caps({}))).toEqual(["Printing", "Copying text and images"]);
    expect(describeRestrictions(caps({ printlow: true, extract: true }))).toEqual([
      "High-quality printing (low-resolution only)",
    ]);
    expect(
      describeRestrictions(
        caps({
          printhigh: true,
          printlow: true,
          extract: true,
          modifyother: false,
          modifyassembly: false,
          modifyforms: false,
          modifyannotations: false,
        }),
      ),
    ).toEqual(["Editing the content", "Adding, deleting or rotating pages", "Adding comments", "Filling in forms"]);
  });

  it("names encryption methods", () => {
    expect(describeEncryption({ method: "AESv3", bits: 256 })).toBe("AES-256");
    expect(describeEncryption({ method: "AESv2", bits: 128 })).toBe("AES-128");
    expect(describeEncryption({ method: "RC4", bits: 40 })).toBe("RC4 40-bit (outdated)");
    expect(describeEncryption({ method: null, bits: null })).toBe("Unknown");
  });

  it("classifies qpdf failures", () => {
    expect(classifyQpdfFailure("qpdf: /in.pdf: invalid password")).toBe("wrong-password");
    expect(classifyQpdfFailure("WARNING: /in.pdf: can't find PDF header\nqpdf: /in.pdf: can't find startxref")).toBe(
      "damaged",
    );
    expect(classifyQpdfFailure("unsupported encryption filter /Adobe.PubSec")).toBe("unsupported");
    expect(classifyQpdfFailure("something else")).toBe("other");
  });
});
