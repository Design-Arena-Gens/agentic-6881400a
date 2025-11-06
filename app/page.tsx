"use client";

import { useMemo, useState } from "react";

type GradeLetter =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "D"
  | "F";

type Course = {
  id: string;
  code: string;
  title: string;
  credit: number | "";
  grade: GradeLetter;
};

type Semester = {
  id: string;
  name: string;
  courses: Course[];
};

type SemesterSummary = {
  gpa: number;
  creditsAttempted: number;
  creditsEarned: number;
  backlogCourses: Course[];
};

const gradeScale: Record<GradeLetter, number> = {
  "A+": 4,
  A: 3.75,
  "A-": 3.5,
  "B+": 3.25,
  B: 3,
  "B-": 2.75,
  "C+": 2.5,
  C: 2.25,
  D: 2,
  F: 0
};

const PASS_MARK = 2;

const defaultCourse = (): Course => ({
  id: Math.random().toString(36).slice(2, 11),
  code: "",
  title: "",
  credit: "",
  grade: "A"
});

const defaultSemester = (index: number): Semester => ({
  id: Math.random().toString(36).slice(2, 11),
  name: `Semester ${index}`,
  courses: [defaultCourse()]
});

export default function HomePage() {
  const [semesters, setSemesters] = useState<Semester[]>([defaultSemester(1)]);

  const gradeOptions = Object.entries(gradeScale).map(([label, value]) => ({
    label,
    value
  }));

  const semesterSummaries = useMemo(() => {
    return semesters.map((semester) => calculateSemesterSummary(semester));
  }, [semesters]);

  const aggregate = useMemo(() => {
    const totalCreditsAttempted = semesterSummaries.reduce(
      (sum, summary) => sum + summary.creditsAttempted,
      0
    );

    const totalGradePoints = semesters.reduce((sum, semester) => {
      return (
        sum +
        semester.courses.reduce((courseSum, course) => {
          if (course.credit === "") return courseSum;
          const credit = Number(course.credit);
          const gradePoint = gradeScale[course.grade] ?? 0;
          return courseSum + credit * gradePoint;
        }, 0)
      );
    }, 0);

    const cgpa = totalCreditsAttempted
      ? Number((totalGradePoints / totalCreditsAttempted).toFixed(2))
      : 0;

    const backlogCourses = semesterSummaries.flatMap(
      (summary) => summary.backlogCourses
    );

    return {
      totalSemesters: semesters.length,
      totalCreditsAttempted,
      cgpa,
      backlogCourses
    };
  }, [semesters, semesterSummaries]);

  const handleSemesterNameChange = (id: string, name: string) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === id
          ? {
              ...semester,
              name
            }
          : semester
      )
    );
  };

  const handleCourseUpdate = (
    semesterId: string,
    courseId: string,
    field: keyof Course,
    value: string
  ) => {
    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id !== semesterId) return semester;
        return {
          ...semester,
          courses: semester.courses.map((course) => {
            if (course.id !== courseId) return course;
            if (field === "credit") {
              const numeric = value === "" ? "" : Number(value);
              return {
                ...course,
                credit: numeric === "" ? "" : Number.isFinite(numeric) ? numeric : course.credit
              };
            }
            return {
              ...course,
              [field]: value
            };
          })
        };
      })
    );
  };

  const handleAddCourse = (semesterId: string) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: [...semester.courses, defaultCourse()]
            }
          : semester
      )
    );
  };

  const handleRemoveCourse = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.filter((course) => course.id !== courseId)
            }
          : semester
      )
    );
  };

  const handleAddSemester = () => {
    setSemesters((prev) => [...prev, defaultSemester(prev.length + 1)]);
  };

  const handleRemoveSemester = (id: string) => {
    setSemesters((prev) => prev.filter((semester) => semester.id !== id));
  };

  return (
    <main>
      <header style={{ marginBottom: "24px" }}>
        <h1>University Result Management</h1>
        <p className="muted">
          Track semester performance, compute CGPA on a 4.00 scale, and monitor backlog status in real time.
        </p>
      </header>

      <section className="card grid highlights" style={{ marginBottom: "24px" }}>
        <div className="highlight">
          <span>CGPA</span>
          <strong>{aggregate.cgpa.toFixed(2)}</strong>
        </div>
        <div className="highlight">
          <span>Total Credits Attempted</span>
          <strong>{aggregate.totalCreditsAttempted}</strong>
        </div>
        <div className="highlight">
          <span>Total Semesters</span>
          <strong>{aggregate.totalSemesters}</strong>
        </div>
        <div className="highlight">
          <span>Active Backlogs</span>
          <strong className={aggregate.backlogCourses.length ? "tag danger" : "tag"}>
            {aggregate.backlogCourses.length}
          </strong>
        </div>
        <div className="highlight" style={{ gridColumn: "span 2" }}>
          <span>Backlog Courses</span>
          <span>
            {aggregate.backlogCourses.length ? (
              <div className="badge-group">
                {aggregate.backlogCourses.map((course) => (
                  <span key={course.id} className="badge">
                    {course.code || "Untitled"} • {course.title || "No title"}
                  </span>
                ))}
              </div>
            ) : (
              <span className="muted">No pending backlogs</span>
            )}
          </span>
        </div>
      </section>

      <section className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem" }}>Semesters</h2>
            <p className="muted">Add semesters, courses, and manage results effortlessly.</p>
          </div>
          <button className="action-btn" onClick={handleAddSemester}>
            + Add Semester
          </button>
        </div>
      </section>

      <div className="grid" style={{ gap: "24px" }}>
        {semesters.length === 0 ? (
          <div className="card empty-state">
            <p>No semesters yet. Start by adding your first semester.</p>
          </div>
        ) : (
          semesters.map((semester, index) => {
            const summary = semesterSummaries[index];
            return (
              <article key={semester.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                  }}
                >
                  <div style={{ flex: 1, marginRight: "12px" }}>
                    <label htmlFor={`semester-name-${semester.id}`}>Semester Name</label>
                    <input
                      id={`semester-name-${semester.id}`}
                      value={semester.name}
                      onChange={(event) =>
                        handleSemesterNameChange(semester.id, event.target.value)
                      }
                      placeholder="e.g. Fall 2024"
                    />
                  </div>
                  {semesters.length > 1 ? (
                    <button
                      className="secondary-btn"
                      style={{ marginTop: "26px" }}
                      onClick={() => handleRemoveSemester(semester.id)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="grid summary-grid" style={{ marginBottom: "24px" }}>
                  <SummaryBadge label="Semester GPA" value={summary.gpa.toFixed(2)} />
                  <SummaryBadge label="Credits Attempted" value={summary.creditsAttempted} />
                  <SummaryBadge label="Credits Earned" value={summary.creditsEarned} />
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Credit</th>
                        <th>Grade</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.courses.map((course) => {
                        const isBacklog = isCourseBacklog(course);
                        return (
                          <tr key={course.id} className="course-row">
                            <td>
                              <input
                                value={course.code}
                                placeholder="CSE-201"
                                onChange={(event) =>
                                  handleCourseUpdate(
                                    semester.id,
                                    course.id,
                                    "code",
                                    event.target.value.toUpperCase()
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                value={course.title}
                                placeholder="Data Structures"
                                onChange={(event) =>
                                  handleCourseUpdate(
                                    semester.id,
                                    course.id,
                                    "title",
                                    event.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min={0}
                                step="0.5"
                                value={course.credit}
                                placeholder="3"
                                onChange={(event) =>
                                  handleCourseUpdate(
                                    semester.id,
                                    course.id,
                                    "credit",
                                    event.target.value
                                  )
                                }
                              />
                            </td>
                            <td>
                              <select
                                value={course.grade}
                                onChange={(event) =>
                                  handleCourseUpdate(
                                    semester.id,
                                    course.id,
                                    "grade",
                                    event.target.value
                                  )
                                }
                              >
                                {gradeOptions.map((grade) => (
                                  <option key={grade.label} value={grade.label}>
                                    {grade.label} ({grade.value.toFixed(2)})
                                  </option>
                                ))}
                              </select>
                              {isBacklog ? <div className="tag danger" style={{ marginTop: "6px" }}>Backlog</div> : null}
                            </td>
                            <td>
                              {semester.courses.length > 1 ? (
                                <button onClick={() => handleRemoveCourse(semester.id, course.id)}>
                                  ✕
                                </button>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "24px"
                  }}
                >
                  <button className="secondary-btn" onClick={() => handleAddCourse(semester.id)}>
                    + Add Course
                  </button>
                  {summary.backlogCourses.length ? (
                    <span className="tag danger">
                      {summary.backlogCourses.length} backlog
                      {summary.backlogCourses.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className="tag">All clear</span>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}

function calculateSemesterSummary(semester: Semester): SemesterSummary {
  let gradePoints = 0;
  let creditsAttempted = 0;
  let creditsEarned = 0;
  const backlogCourses: Course[] = [];

  for (const course of semester.courses) {
    if (course.credit === "") continue;
    const credit = Number(course.credit);
    const gradePoint = gradeScale[course.grade] ?? 0;
    gradePoints += gradePoint * credit;
    creditsAttempted += credit;

    if (gradePoint >= PASS_MARK) {
      creditsEarned += credit;
    } else {
      backlogCourses.push(course);
    }
  }

  const gpa = creditsAttempted ? Number((gradePoints / creditsAttempted).toFixed(2)) : 0;

  return {
    gpa,
    creditsAttempted,
    creditsEarned,
    backlogCourses
  };
}

function isCourseBacklog(course: Course) {
  if (course.credit === "") return false;
  const gradePoint = gradeScale[course.grade] ?? 0;
  return gradePoint < PASS_MARK;
}

type SummaryBadgeProps = {
  label: string;
  value: string | number;
};

function SummaryBadge({ label, value }: SummaryBadgeProps) {
  return (
    <div className="highlight">
      <span>{label}</span>
      <strong>{typeof value === "number" ? Number(value).toFixed(2) : value}</strong>
    </div>
  );
}
