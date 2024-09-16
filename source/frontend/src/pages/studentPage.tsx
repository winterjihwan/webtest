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

const StudentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user as User;

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAllCourses = async () => {
    try {
      const response = await axios.post(
        "https://webtest-g9ji.onrender.com/4500/get_all_courses",
      );
      if (response.data && response.data.payload) {
        setAllCourses(response.data.payload);
      } else {
        setErrorMessage("Failed to fetch courses. Data is empty.");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch courses.");
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.post(
        "https://webtest-g9ji.onrender.com/4500/get_enrolled_courses",
        {
          student_id: user.student_id,
        },
      );
      if (response.data && response.data.payload) {
        setEnrolledCourses(response.data.payload);
      } else {
        setErrorMessage("Failed to fetch enrolled courses.");
      }
    } catch (error) {
      setErrorMessage("Failed to fetch enrolled courses.");
    }
  };

  useEffect(() => {
    if (user && user.role === "Student") {
      fetchAllCourses();
      fetchEnrolledCourses();
    }
  }, [user]);

  const handleEnroll = useCallback(
    async (courseId: string) => {
      try {
        const response = await axios.post(
          "https://webtest-g9ji.onrender.com/4500/enroll",
          {
            course_id: courseId,
            student_id: user.student_id,
          },
        );

        if (!response.data.error) {
          setSuccessMessage(`Successfully enrolled in course ${courseId}`);
          setErrorMessage(null);
          fetchAllCourses();
          fetchEnrolledCourses();
        } else {
          setErrorMessage(`Failed to enroll in course ${courseId}`);
          setSuccessMessage(null);
        }
      } catch (error) {
        setErrorMessage(`Failed to enroll in course ${courseId}`);
        setSuccessMessage(null);
      }
    },
    [user.student_id],
  );

  const handleViewLectures = useCallback(
    (courseId: string) => {
      navigate(`/lecturePage/${courseId}`, { state: { user } });
    },
    [navigate, user],
  );

  const handleViewActivityStream = useCallback(() => {
    navigate("/activityStream", { state: { user } });
  }, [navigate, user]);

  const isEnrolled = (course: Course): boolean => {
    return course.enrolled_ids.includes(user.student_id);
  };

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Welcome, {user.name}</h2>
      <p>Username: {user.username}</p>
      <p>
        {user.role === "Student"
          ? `Student ID: ${user.student_id}`
          : `Professor ID: ${user.student_id}`}
      </p>
      <p>Role: {user.role}</p>

      <button onClick={handleViewActivityStream} style={styles.activityButton}>
        View Activity Stream
      </button>

      <h3>Available Courses</h3>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      {allCourses.length === 0 ? (
        <p>No courses available</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {allCourses.map((course) => (
            <li key={course.course_id} style={styles.courseCard}>
              <p>
                <strong>{course.course_name}</strong>
              </p>
              <p>Professor ID: {course.professor_id}</p>
              <p>Enrolled Students: {course.enrolled_ids.length}</p>
              <p>Student IDs: {course.enrolled_ids.join(", ")}</p>

              {isEnrolled(course) ? (
                <button
                  onClick={() => handleViewLectures(course.course_id)}
                  style={styles.viewButton}
                >
                  View Lectures
                </button>
              ) : (
                <button
                  onClick={() => handleEnroll(course.course_id)}
                  style={styles.enrollButton}
                >
                  Enroll
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  courseCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    margin: "10px 0",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "left" as const,
  },
  enrollButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  viewButton: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  activityButton: {
    padding: "10px 20px",
    backgroundColor: "#FF5733",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
};

export default StudentPage;
