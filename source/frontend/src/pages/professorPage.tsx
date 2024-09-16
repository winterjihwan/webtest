import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

interface User {
  username: string;
  password_hash: string;
  name: string;
  student_id: string;
  role: "Professor" | "Student";
}

interface Course {
  course_id: string;
  course_name: string;
  professor_id: string;
  enrolled_ids: string[];
}

const ProfessorPage: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user as User;
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.post("http://localhost:4500/get_courses", {
          professor_id: user.student_id,
        });
        console.log("response: ", response);
        setCourses(response.data.payload);
      } catch (error) {
        setErrorMessage("Failed to fetch courses.");
      }
    };

    if (user && user.role === "Professor") {
      fetchCourses();
    }
  }, [user]);

  const handleAddCourse = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      try {
        const response = await axios.post("http://localhost:4500/add_course", {
          professor_id: user.student_id,
          course_id: courseId,
          course_name: courseName,
          enrolled_ids: [],
        });
        console.log("response: ", response);

        setSuccessMessage("Course added successfully!");
        setErrorMessage(null);

        setCourses((prevCourses) => [
          ...prevCourses,
          {
            course_id: courseId,
            course_name: courseName,
            professor_id: user.student_id,
            enrolled_ids: [],
          },
        ]);

        setCourseId("");
        setCourseName("");
      } catch (error) {
        setErrorMessage("Failed to add course.");
        setSuccessMessage(null);
      }
    },
    [courseId, courseName, user],
  );

  const handleDropStudent = useCallback(
    async (courseId: string, studentId: string) => {
      try {
        const response = await axios.post(
          "http://localhost:4500/remove_student",
          {
            course_id: courseId,
            student_id: studentId,
          },
        );
        console.log("Drop student response: ", response);

        if (!response.data.error) {
          setSuccessMessage(`Successfully dropped student ${studentId}`);
          setCourses((prevCourses) =>
            prevCourses.map((course) =>
              course.course_id === courseId
                ? {
                    ...course,
                    enrolled_ids: course.enrolled_ids.filter(
                      (id) => id !== studentId,
                    ),
                  }
                : course,
            ),
          );
        } else {
          setErrorMessage(`Failed to drop student ${studentId}`);
        }
      } catch (error) {
        setErrorMessage("Failed to drop student.");
      }
    },
    [],
  );

  const handleCourseClick = (courseId: string) => {
    navigate(`/lecturePage/${courseId}`, { state: { user } });
  };

  if (!user || user.role !== "Professor") {
    return <div>No user data available or not authorized.</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Welcome, {user.name}</h2>
      <p>Username: {user.username}</p>
      <p>Professor ID: {user.student_id}</p>
      <p>Role: {user.role}</p>

      <h3>Your Courses</h3>
      {courses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li
              key={course.course_id}
              style={{
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                margin: "10px 0",
                backgroundColor: "#f9f9f9",
                textAlign: "left",
              }}
            >
              <strong onClick={() => handleCourseClick(course.course_id)}>
                {course.course_name} (Enrolled: {course.enrolled_ids.length})
              </strong>
              <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                {course.enrolled_ids.length === 0 ? (
                  <p>No students enrolled</p>
                ) : (
                  course.enrolled_ids.map((studentId) => (
                    <li key={studentId}>
                      Student ID: {studentId}{" "}
                      <button
                        onClick={() =>
                          handleDropStudent(course.course_id, studentId)
                        }
                        style={{
                          marginLeft: "10px",
                          padding: "5px 10px",
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                        }}
                      >
                        Drop
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <h3>Add a New Course</h3>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <form onSubmit={handleAddCourse}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="course_id">Course ID:</label>
          <br />
          <input
            type="text"
            id="course_id"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="course_name">Course Name:</label>
          <br />
          <input
            type="text"
            id="course_name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" style={{ padding: "10px 20px" }}>
          Add Course
        </button>
      </form>
    </div>
  );
};

export default ProfessorPage;
