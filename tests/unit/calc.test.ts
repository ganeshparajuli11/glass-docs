import { describe, expect, it } from "vitest";
import { computeGpa, currentWeightedGrade, requiredOnRemaining } from "@/lib/calc/gpa";
import { attendancePercent, classesCanMiss, classesNeeded } from "@/lib/calc/attendance";
import { percentChange, percentOf, whatPercent } from "@/lib/calc/percentage";
import { computeEmi } from "@/lib/calc/emi";
import { layoutSheet } from "@/lib/image/passport";
import { generateCoverPage } from "@/lib/pdf/operations/cover-page";
import { PDFDocument } from "pdf-lib";

describe("GPA", () => {
  it("weights by credits", () => {
    const { gpa } = computeGpa([
      { credits: 3, gradePoints: 4.0 },
      { credits: 1, gradePoints: 2.0 },
    ]);
    expect(gpa).toBeCloseTo(3.5);
  });

  it("required final mark to reach target", () => {
    const needed = requiredOnRemaining(
      [
        { weight: 60, score: 70 },
        { weight: 40, score: null },
      ],
      75,
    );
    expect(needed).toBeCloseTo(82.5);
    expect(
      currentWeightedGrade([
        { weight: 60, score: 70 },
        { weight: 40, score: null },
      ]),
    ).toBeCloseTo(70);
  });
});

describe("attendance", () => {
  it("computes percent and classes needed", () => {
    expect(attendancePercent(18, 24)).toBeCloseTo(75);
    expect(classesNeeded(18, 24, 80)).toBe(6);
    expect(classesNeeded(20, 24, 80)).toBe(0);
    expect(classesCanMiss(20, 24, 80)).toBe(1);
  });
});

describe("percentage", () => {
  it("three modes", () => {
    expect(percentOf(15, 200)).toBe(30);
    expect(whatPercent(30, 200)).toBe(15);
    expect(percentChange(200, 250)).toBe(25);
    expect(whatPercent(1, 0)).toBeNull();
  });
});

describe("EMI", () => {
  it("matches standard formula", () => {
    const r = computeEmi(100000, 12, 12)!;
    expect(r.emi).toBeCloseTo(8884.88, 1);
    expect(r.totalInterest).toBeGreaterThan(0);
  });
  it("zero-rate loans divide evenly", () => {
    const r = computeEmi(1200, 0, 12)!;
    expect(r.emi).toBeCloseTo(100);
    expect(r.totalInterest).toBe(0);
  });
});

describe("passport sheet layout", () => {
  it("fits 35x45 photos on 4x6 paper", () => {
    const layout = layoutSheet({ widthMm: 35, heightMm: 45 }, { widthMm: 152.4, heightMm: 101.6 });
    expect(layout.cols).toBe(3);
    expect(layout.rows).toBe(2);
    expect(layout.positions.length).toBe(6);
  });
});

describe("cover page", () => {
  it("generates a one-page A4 PDF", async () => {
    const bytes = await generateCoverPage({
      institution: "University of Greenwich",
      assignmentTitle: "Managing Across Cultures — Case Analysis",
      module: "INDU1033",
      studentName: "A Student",
      studentId: "001234567",
      tutor: "Dr T. Utor",
      submissionDate: "2026-08-01",
      wordCount: "2,500",
    });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(595);
  });
});
