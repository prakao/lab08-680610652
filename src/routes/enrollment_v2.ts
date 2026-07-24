import { Router, type Request, type Response } from "express";
import {
  zStudentPostBody,
  zStudentPutBody,
  zStudentId,
  zCourseId,
  zEnrollmentBody,
} from "../libs/zodValidators.js";

import type { Student, Course } from "../libs/types.js";

// import database
import { students, courses, enrollments } from "../db/db.js";
import { error } from "console";

const router = Router();

router.delete("/", (req: Request, res: Response) => {
  try {
    const body = req.body;
    const valid = zEnrollmentBody.safeParse(body);

    if (!valid.success) {
      return res.status(400).json({
        ok: false,
        message: valid.error.issues[0]?.message,
      });
    }
    const sId = valid.data.studentId;
    const sCourse = valid.data.courseId;

    const foundedIndex = enrollments.findIndex(
      (e) => e.studentId === sId && e.courseId === sCourse,
    );
    if (foundedIndex === -1) {
      return res.status(404).json({
        ok: false,
        message: "Enrollment does not exist",
      });
    }
    enrollments.splice(foundedIndex, 1);
    const deleteEnStudent = students.find((s) => s.studentId === sId);
    if (deleteEnStudent && deleteEnStudent.courses) {
      deleteEnStudent.courses = deleteEnStudent.courses.filter(
        (c) => c !== sCourse,
      );
    }
    return res.status(200).json({
      ok: true,
      message: "Enrollment has been deleted",
    });
  } catch (err) {}
});

export default router;
