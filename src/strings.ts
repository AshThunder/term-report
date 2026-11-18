import type { Labels } from "./types";

export const ENGLISH: Labels = {
  termReport: "Term report",
  reportFor: "Report for {name}",
  pupil: "Pupil",
  pupilNo: "Pupil no.",
  className: "Class",
  tutor: "Form tutor",
  term: "Term",
  reportDate: "Report date",
  attendance: "Attendance",
  present: "Sessions attended",
  absent: "Absences",
  late: "Lates",
  average: "Average",
  classAverage: "Class average",
  subject: "Subject",
  teacher: "Teacher",
  result: "Result",
  grade: "Grade",
  effort: "Effort",
  comment: "Comment",
  subjects: "Subjects",
  tutorComment: "Form tutor's comment",
  headComment: "Headteacher",
  targets: "Targets for next term",
  dates: "Coming up",
  awards: "Awards",
  gradingKey: "Grades",
  effortKey: "Effort",
  greeting: "Dear {name},",
  readyLine: "{name}'s report for the {term} is ready.",
  openReport: "Read the full report",
  pdfAttached: "The report is attached as a PDF.",
  questions: "Questions? Reply to this email or write to {email}.",
  signedBy: "Signed",
  page: "Page",
  of: "of",
  awardTo: "Awarded to",
  awardedOn: "{date}",
  certificate: "Certificate",
  classOverview: "Class results",
  pupilsCount: "{count} pupils",
  topSubject: "Strongest subject",
  strongest: "Strengths",
  noAwards: "No awards this term",
  sessionsOf: "{present} of {total}",
  improvedBy: "Up {points} on last term",
  keyDates: "Dates",
  parentsPortal: "Parents' portal",
};

export function labelsFor(overrides: Partial<Labels> = {}): Labels {
  return { ...ENGLISH, ...overrides };
}

export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (all, key: string) => values[key] ?? all);
}
