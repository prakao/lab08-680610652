import { Router, type Request, type Response } from "express";
import {
  zStudentPostBody,
  zStudentPutBody,
  zStudentId,
  zCourseId,
} from "../libs/zodValidators.js";

import type { Student, Course } from "../libs/types.js";

// import database
import { students, courses, enrollments } from "../db/db.js";
import { error } from "console";

const router = Router();

//GET/api/v1/enrollments
router.get("/", (req: Request, res: Response) => {
  try {
    const courseNo = req.query.courseNo as string;
    const studentId = req.query.studentId as string;
    if ((!courseNo && !studentId) || (courseNo && studentId)) {
      return res.status(400).json({
        ok: false,
        message: "Please provide either studentId or courseNo and not both!",
      });
    } else if (courseNo) {
      const valid = zCourseId.safeParse(courseNo);
      if (!valid.success) {
        return res.status(400).json({
          ok: false,
          message: valid.error.issues[0]?.message,
        });
      }
      let studentFiltered = students
        .filter((s) => s.courses?.includes(courseNo))
        .map((s) => ({
          studentId: s.studentId,
          firstname: s.firstName,
          lastname: s.lastName,
          program: s.program,
        }));
      return res.status(200).json({
        ok: true,
        students: studentFiltered,
      });
    } else if (studentId) {
      const valid = zStudentId.safeParse(studentId);
      if (!valid.success) {
        return res.status(400).json({
          ok: false,
          message: valid.error.issues[0]?.message,
        });
      }
      const studentFound = students.find((s) => s.studentId === studentId);
      if (!studentFound) {
        return res.status(404).json({
          ok: false,
          message: "Student not found",
        });
      }
      const sCourses = courses
        .filter((c) => studentFound.courses?.includes(c.courseId))
        .map((c) => ({
          courseNo: c.courseId,
          title: c.courseTitle,
        }));
      return res.status(200).json({
        ok: true,
        courses: sCourses,
      });
    }
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;
