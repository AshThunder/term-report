/**
 * The one class file. Every email, page, report card, certificate and the class mark sheet is
 * read from a file of this shape. Scores are on the school's own scale (a percentage, 0 to 10,
 * 1 to 7, 0 to 20): the grade bands in `settings.scale` turn them into grades.
 */
export interface ClassFile {
  school: School;
  settings: Settings;
  /** Overrides for any printed word: the Spanish sample prints Spanish. Keys in strings.ts. */
  labels?: Partial<Labels>;
  term: Term;
  class: { name: string; year: string; tutor: string };
  subjects: Subject[];
  /** Awards, worked out from the results by rule: nobody types who won. */
  awards: AwardRule[];
  pupils: Pupil[];
}

export interface School {
  name: string;
  /** Two or three letters for the crest. No logo file is needed in any output. */
  monogram: string;
  address: string[];
  website: string;
  email: string;
  phone: string;
  accent: string;
  head: { name: string; title: string };
  /** Where families open reports online. The pupil id is appended. */
  portalUrl: string;
}

export interface Settings {
  locale: string;
  scale: {
    max: number;
    /** Decimal places a score is shown with. */
    decimals: number;
    /** Shown after a score ("%"), or "". */
    suffix: string;
    /** Highest first. A score gets the first band whose `min` it reaches. */
    bands: { min: number; grade: string; label: string }[];
  };
  /** Effort descriptors, 1 (best) to 4. */
  effort: [string, string, string, string];
}

export interface Term {
  name: string;
  start: string;
  end: string;
  reportDate: string;
  /** Attendance sessions possible this term (two a day in many schools). */
  sessions: number;
  nextTerm: string;
  dates: { date: string; label: string }[];
}

export interface Subject {
  code: string;
  name: string;
  teacher: string;
}

export type AwardRule =
  | { code: string; rule: "subject-top"; title: string; description: string; minScore: number }
  | { code: string; rule: "full-attendance"; title: string; description: string }
  | { code: string; rule: "most-improved"; title: string; description: string }
  | { code: string; rule: "top-overall"; title: string; description: string };

export interface Pupil {
  id: string;
  name: string;
  firstName: string;
  guardian: { name: string; email: string };
  attendance: { present: number; absent: number; late: number };
  /** Last term's average on the same scale, for "most improved". Null if there is none. */
  previousAverage: number | null;
  results: Record<string, { score: number; effort: 1 | 2 | 3 | 4; comment: string }>;
  tutorComment: string;
  headComment: string;
  targets: string[];
}

export interface Labels {
  termReport: string;
  reportFor: string;
  pupil: string;
  pupilNo: string;
  className: string;
  tutor: string;
  term: string;
  reportDate: string;
  attendance: string;
  present: string;
  absent: string;
  late: string;
  average: string;
  classAverage: string;
  subject: string;
  teacher: string;
  result: string;
  grade: string;
  effort: string;
  comment: string;
  subjects: string;
  tutorComment: string;
  headComment: string;
  targets: string;
  dates: string;
  awards: string;
  gradingKey: string;
  effortKey: string;
  greeting: string;
  readyLine: string;
  openReport: string;
  pdfAttached: string;
  questions: string;
  signedBy: string;
  page: string;
  of: string;
  awardTo: string;
  awardedOn: string;
  certificate: string;
  classOverview: string;
  pupilsCount: string;
  topSubject: string;
  strongest: string;
  noAwards: string;
  sessionsOf: string;
  improvedBy: string;
  keyDates: string;
  parentsPortal: string;
}
