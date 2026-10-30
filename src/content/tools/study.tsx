import Link from "next/link";
import type { ToolContentMap } from "./types";

/** Long-form content for the calculators and the student toolkit. */
export const studyToolContent: ToolContentMap = {
  "gpa-calculator": {
    lede: (
      <>
        Works out a credit-weighted grade point average from your courses, so a
        five-credit module counts for more than a two-credit one — which is how
        almost every institution actually calculates it.
      </>
    ),
    steps: [
      <>Add a row for each course in the semester.</>,
      <>Enter the credits (or credit hours) and the letter grade you received.</>,
      <>
        Read the GPA as you go. Adding a row updates it immediately, so you can
        model an outstanding result before you have it.
      </>,
    ],
    sections: [
      {
        heading: "How the calculation works",
        body: (
          <>
            <p>
              Each grade maps to a number of grade points on a 4.0 scale — A is
              4.0, B is 3.0, and so on. Each course contributes its grade points
              multiplied by its credits, all of those are added up, and the total
              is divided by the total credits. That last division is what makes
              it an average rather than a sum, and what stops a semester with six
              courses from beating one with four.
            </p>
            <p>
              The weighting has a practical consequence worth internalising: a
              poor grade in a heavy module costs far more than the same grade in
              a light one. If you are deciding where to put a limited number of
              revision hours, the credit column tells you where they buy the
              most.
            </p>
          </>
        ),
      },
      {
        heading: "Check your institution's scale",
        body: (
          <>
            <p>
              This uses the common 4.0 letter-grade mapping, and institutions
              vary more than students expect. Some award 4.0 for an A+ and cap A
              at 3.9 or 4.0 alike; some use plus and minus grades with quarter
              points, others do not; some run a 5.0 or 10.0 scale entirely.
              Universities in several countries convert from percentages using
              their own bands, and those bands differ between institutions in the
              same city.
            </p>
            <p>
              So treat the number here as an accurate calculation of a standard
              scale rather than as your official record. Where an application
              asks for a GPA on a specific scale, use your transcript and your
              institution&apos;s published conversion — not a converted figure
              from a general-purpose tool, including this one.
            </p>
          </>
        ),
      },
      {
        heading: "Semester GPA and cumulative GPA",
        body: (
          <>
            <p>
              A semester GPA covers one term. A cumulative GPA covers everything
              so far, and it is not the average of your semester GPAs unless
              every semester carried identical credits. To compute it here, enter
              every course from every semester in one list and read the result.
            </p>
            <p>
              This is also the honest way to see how much a single term can move
              a cumulative average: after several semesters, it moves slowly,
              because the earlier credits are still in the denominator. Knowing
              that early is more useful than discovering it late. For working out
              what you need on a specific piece of assessment, the{" "}
              <Link href="/tools/grade-calculator">grade calculator</Link>{" "}
              answers that question directly.
            </p>
          </>
        ),
      },
    ],
  },

  "grade-calculator": {
    lede: (
      <>
        Calculates your weighted average across a module&apos;s assessments, and
        tells you what average you need on the work that is left to reach a
        target grade.
      </>
    ),
    steps: [
      <>
        Add each assessment with its weight — the percentage of the module it is
        worth.
      </>,
      <>Enter the scores you already have, and leave future work blank.</>,
      <>Set your target for the module overall.</>,
      <>
        Read the required average on the remaining work, and judge whether it is
        realistic.
      </>,
    ],
    sections: [
      {
        heading: "Weights, not marks out of ten",
        body: (
          <>
            <p>
              Weight is how much of the final module grade an assessment decides,
              and it should come from your module handbook. It is unrelated to
              how many marks the paper is out of: a coursework marked out of 40
              can be worth 60% of the module, and an exam out of 100 can be worth
              25%. Enter the percentage weight, and the score as a percentage of
              that assessment.
            </p>
            <p>
              The tool assumes the assessments you list are the whole module, so
              the weights should add to 100. If they add to less, the calculation
              treats what you entered as the complete picture and the result will
              be optimistic. Listing everything, including the pieces you have
              not started, is what makes the projection meaningful.
            </p>
          </>
        ),
      },
      {
        heading: "What “needed on remaining” means",
        body: (
          <>
            <p>
              It is the average mark you would have to achieve across every
              assessment you have left blank in order to finish the module at
              your target. It is an average, so a required 70% across two
              remaining pieces can be met with 60 and 80 — useful when one of
              them plays to your strengths.
            </p>
            <p>
              The number is occasionally brutal, and that is the point. A
              required average above 100 means the target is no longer reachable
              and it is better to know now, when there is still time to protect
              the grade you can get. A required average of 35% means the module
              is essentially secured and your effort belongs elsewhere. Both
              answers change what you do this week, which is more than a current
              average tells you.
            </p>
          </>
        ),
      },
      {
        heading: "Where the arithmetic stops",
        body: (
          <>
            <p>
              Real regulations add rules that no weighted average captures. Many
              modules require a minimum mark on a specific component regardless
              of the total; some cap the grade available on a resubmission; some
              round at the module level, some at the award level; and
              non-submission of a compulsory element can fail a module you were
              mathematically passing.
            </p>
            <p>
              Read the handbook for those, and use this for the arithmetic. If
              your worry is attendance rather than marks, the{" "}
              <Link href="/tools/attendance-calculator">
                attendance calculator
              </Link>{" "}
              handles the equivalent question there, and the{" "}
              <Link href="/tools/gpa-calculator">GPA calculator</Link> turns
              finished modules into an overall figure.
            </p>
          </>
        ),
      },
    ],
  },

  "attendance-calculator": {
    lede: (
      <>
        Shows your current attendance percentage, how many classes you must
        attend in a row to reach a required minimum, and how many you could miss
        while staying above it.
      </>
    ),
    steps: [
      <>Enter the number of classes held so far and the number you attended.</>,
      <>Set the required percentage — 75% is the most common threshold.</>,
      <>
        Read your current percentage, and either how many classes you need or how
        many you can afford to miss.
      </>,
    ],
    sections: [
      {
        heading: "Why recovering is harder than it looks",
        body: (
          <>
            <p>
              Every class you miss goes into both halves of the fraction: it
              raises the total held while leaving your attended count where it
              was. Recovering therefore takes more than one class per class
              missed. At a 75% requirement, each absence needs roughly three
              consecutive attendances to undo — and the further below the line
              you are, the longer the climb, until at some point the term runs
              out of classes before the arithmetic works.
            </p>
            <p>
              That asymmetry is the single most useful thing this calculator
              shows. Checking in week five, when the recovery is three classes,
              is a completely different situation from checking in week eleven,
              when it is thirty.
            </p>
          </>
        ),
      },
      {
        heading: "The two questions it answers",
        body: (
          <>
            <p>
              If you are below the requirement, it reports the smallest number of
              consecutive classes you must attend to cross it — assuming you
              attend all of them, which is the assumption that makes the number
              meaningful.
            </p>
            <p>
              If you are above it, it reports how many further classes you could
              miss before dropping below. Treat that as a buffer for illness and
              emergencies rather than a budget to spend: every class you miss
              uses up a whole one, while every class you attend adds back only
              a fraction — a third of a class at a 75% requirement.
            </p>
          </>
        ),
      },
      {
        heading: "Institution rules this cannot know",
        body: (
          <>
            <p>
              This is a straightforward projection, and real attendance
              regulations are not. Medical and compassionate leave is often
              excluded from the count; some institutions calculate per subject
              and others across the whole programme; some weight practicals or
              labs more heavily than lectures; and many run separate thresholds
              for a warning and for exclusion from an examination.
            </p>
            <p>
              Use the figure to know where you stand and how urgent it is, then
              check the actual regulation — and talk to your department early if
              you are behind for a reason they would accept. That conversation
              works far better before the threshold is missed than after.
            </p>
            <p>
              For the formulas behind each figure, a table of what one absence
              costs at different requirements, and how to tell whether a term
              can still be recovered, read{" "}
              <Link href="/learn/attendance-percentage-classes-you-can-miss">
                how many classes you can miss
              </Link>
              .
            </p>
          </>
        ),
      },
    ],
  },

  "percentage-calculator": {
    lede: (
      <>
        Three calculations that cover most everyday percentage questions: a
        percentage of a value, one number as a percentage of another, and the
        percentage change between two numbers.
      </>
    ),
    steps: [
      <>Pick the mode that matches your question.</>,
      <>Enter the two numbers it asks for.</>,
      <>Read the result, rounded to two decimal places.</>,
    ],
    sections: [
      {
        heading: "Choosing the right mode",
        body: (
          <>
            <p>
              <strong>X% of a value</strong> answers &ldquo;what is 15% of
              200?&rdquo; — the shape of a discount, a tip, a tax amount, or a
              commission. The answer, 30, is the size of the part.
            </p>
            <p>
              <strong>A part as a percentage</strong> answers &ldquo;36 out of 40
              is what percent?&rdquo; It is the mode for turning marks into a
              percentage, or a share into a proportion. The answer is 90%.
            </p>
            <p>
              <strong>Percentage change</strong> answers &ldquo;what is the
              change from 250 to 300?&rdquo; — a price rise, a growth rate, a
              drop in usage. The answer, 20%, is expressed relative to the
              starting number.
            </p>
          </>
        ),
      },
      {
        heading: "Discounts, and why the reverse is not symmetric",
        body: (
          <>
            <p>
              For a discount, use the first mode to find the amount off and
              subtract it: 15% of 200 is 30, so the price is 170. To go the other
              way — you paid 170 and want to know what percentage was taken off
              an original 200 — use percentage change, which gives −15%.
            </p>
            <p>
              The trap is assuming the two directions cancel. A price cut by 20%
              needs a 25% rise to get back to where it started, because the rise
              is calculated on the smaller number. The same arithmetic explains
              why a 50% drop needs a 100% gain to recover, which is the most
              expensive percentage misunderstanding there is.
            </p>
          </>
        ),
      },
      {
        heading: "Percentages and percentage points",
        body: (
          <>
            <p>
              A rate moving from 4% to 6% has risen by two percentage points, and
              by 50%. Both statements are true and they describe the same event,
              which is why the distinction matters whenever a rate, a share, or
              an interest figure is being discussed. Percentage change treats the
              numbers as quantities and reports the 50%; the two-point difference
              is simple subtraction.
            </p>
            <p>
              Results are rounded to two decimal places for readability, so
              chaining several calculations by hand accumulates a little rounding
              error. For money over a repayment schedule, use a calculation built
              for it, such as the{" "}
              <Link href="/tools/emi-calculator">loan EMI calculator</Link>.
            </p>
          </>
        ),
      },
    ],
  },

  "emi-calculator": {
    lede: (
      <>
        Works out the equated monthly instalment for a loan — the fixed monthly
        payment — along with the total interest and the total amount repaid over
        the term. General information, not financial advice.
      </>
    ),
    steps: [
      <>Enter the loan amount you are considering.</>,
      <>Enter the annual interest rate quoted by the lender.</>,
      <>Enter the term in years.</>,
      <>
        Read the monthly payment, the total interest, and the total cost of the
        loan.
      </>,
    ],
    sections: [
      {
        heading: "What the formula does",
        body: (
          <>
            <p>
              The calculation uses the standard reducing-balance formula:
              P·r·(1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P is the principal, r is the
              monthly interest rate, and n is the number of monthly payments.
              Reducing balance means interest is charged on what you still owe,
              so it falls as the loan is repaid.
            </p>
            <p>
              The instalment stays the same every month, but what it is composed
              of changes. Early payments are mostly interest and repay little
              principal; late payments are mostly principal. That is why paying a
              loan off early saves more than a simple pro-rata share of the
              interest suggests, and why the total interest figure is worth
              looking at alongside the monthly one.
            </p>
          </>
        ),
      },
      {
        heading: "Term, rate, and total cost",
        body: (
          <>
            <p>
              Lengthening the term lowers the monthly payment and raises the
              total interest, often substantially, because you are borrowing the
              money for longer. Comparing two loans on the monthly figure alone
              therefore favours the more expensive one whenever the terms differ.
              Compare the total cost as well, and compare loans over the same
              term where you can.
            </p>
            <p>
              The rate to enter is the annual rate the lender quotes for the
              loan. Be careful with rates that are described differently — a flat
              rate is calculated on the original amount for the whole term and is
              much more expensive than the same number quoted on a reducing
              balance.
            </p>
            <p>
              <Link href="/learn/loan-emi-calculation-compare-loans">
                How loan EMI is calculated
              </Link>{" "}
              works through examples: how much of each payment is interest,
              what a longer term really costs, how to find the reducing-balance
              rate hidden in a flat quote with this calculator, and whether to
              keep the EMI or the term after a prepayment.
            </p>
          </>
        ),
      },
      {
        heading: "What is not included",
        body: (
          <>
            <p>
              This is the loan arithmetic and nothing else. Arrangement and
              processing fees, insurance sold alongside the loan, late-payment
              charges, early-settlement penalties, taxes, and the lender&apos;s
              own rounding rules are all outside it, and together they can move
              the real cost noticeably. A variable rate changes the payment over
              time, which a fixed calculation cannot represent at all.
            </p>
            <p>
              Use the result to compare options and to sanity-check what you have
              been quoted, then rely on the lender&apos;s written schedule for
              the actual figures. Nothing here is financial advice, and decisions
              about borrowing are worth discussing with a qualified adviser and
              with the lender directly.
            </p>
          </>
        ),
      },
    ],
  },

  "cover-page": {
    lede: (
      <>
        Generates a clean PDF title page for an assignment — module, title,
        student details, date — ready to put in front of your work.
      </>
    ),
    steps: [
      <>Fill in the fields your department expects to see.</>,
      <>Generate the cover page and download the PDF.</>,
      <>
        Combine it with your assignment using{" "}
        <Link href="/tools/merge-pdf">Merge PDF</Link>, cover page first.
      </>,
      <>Open the merged file and check that it starts with the cover.</>,
    ],
    sections: [
      {
        heading: "Check for an official template first",
        body: (
          <>
            <p>
              Plenty of departments issue a mandatory cover sheet, and some
              require a signed declaration of academic honesty on it. Where one
              exists, use it — a nicer-looking page that omits a required
              declaration can cost marks or hold up marking, and neither is worth
              the aesthetic improvement.
            </p>
            <p>
              This tool is for the common case where no template is prescribed
              and the guidance simply asks for your name, student number, module
              code, title, and submission date on a front page. It is also useful
              for a portfolio or a report that has no formal requirements at all.
            </p>
          </>
        ),
      },
      {
        heading: "What to put on it",
        body: (
          <>
            <p>
              Include what the marker needs to identify and log your work: module
              code and title, assignment title, your name and student number,
              your tutor or seminar group where that matters, the submission
              date, and a word count if the brief asks for one.
            </p>
            <p>
              Where marking is anonymous, leave your name off and use the student
              number alone — putting a name on an anonymous submission is a
              genuine problem rather than a small one. Check the brief; anonymous
              marking is far more common than it used to be.
            </p>
          </>
        ),
      },
      {
        heading: "Assembling the finished submission",
        body: (
          <>
            <p>
              The cover page is a separate one-page PDF, so the last step is
              always to join it to your work. Export your assignment as a PDF,
              then merge the two with the cover first. If your document needs
              page numbers, add them with{" "}
              <Link href="/tools/page-numbers">Add page numbers</Link>{" "}
              <em>after</em> merging and set &ldquo;skip first pages&rdquo; to 1,
              so the cover stays unnumbered and the body starts at 1.
            </p>
            <p>
              Two limits to know before you rely on it: text is currently limited
              to Latin characters, because font embedding for other scripts has
              not shipped, so a title in Devanagari or Arabic will not render
              correctly yet. And everything is generated in your browser, so
              nothing you type — including your student number — is sent
              anywhere.
            </p>
          </>
        ),
      },
    ],
  },
};
