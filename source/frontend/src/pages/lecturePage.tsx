import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";

interface User {
  username: string;
  password_hash: string;
  name: string;
  student_id: string;
  role: "Professor" | "Student";
}

interface Lecture {
  lecture_id: string;
  course_id: string;
  professor_id: string;
  content: string;
}

const LecturePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const user = location.state?.user as User;

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [lectureSubject, setLectureSubject] = useState<string>("");
  const [lectureContent, setLectureContent] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await axios.post(
          "https://webtest-g9ji.onrender.com/get_lectures",
          {
            course_id: courseId,
          },
        );
        if (response.data && response.data.payload) {
          setLectures(response.data.payload);
        } else {
          setErrorMessage("Failed to fetch lectures. Data is empty.");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch lectures.");
        setLectures([]);
      }
    };

    fetchLectures();
  }, [courseId]);

  const handleAddLecture = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const combinedText = `${lectureSubject}: ${lectureContent}`;

      try {
        const response = await axios.post(
          "https://webtest-g9ji.onrender.com/add_lecture",
          {
            lecture_id: `${courseId}-${new Date().getTime()}`,
            course_id: courseId,
            professor_id: user.student_id,
            content: combinedText,
          },
        );

        if (!response.data.error) {
          setSuccessMessage("Lecture added successfully!");
          setErrorMessage(null);

          setLectures((prevLectures) => [
            ...(prevLectures || []),
            {
              lecture_id: response.data.payload,
              professor_id: user.student_id,
              course_id: courseId as string,
              content: combinedText,
            },
          ]);

          setLectureSubject("");
          setLectureContent("");
        } else {
          setErrorMessage(`Failed to add lecture: ${response.data.error}`);
          setSuccessMessage(null);
        }
      } catch (error) {
        setErrorMessage("Failed to add lecture due to an error.");
        setSuccessMessage(null);
      }
    },
    [lectureSubject, lectureContent, courseId, user],
  );

  if (!lectures) {
    return (
      <div style={styles.container}>
        <p>{errorMessage || "No lectures found for this course."}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2>Lectures for Course: {courseId}</h2>

      {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p style={styles.successText}>{successMessage}</p>}

      {lectures.length === 0 ? (
        <p>No lectures available</p>
      ) : (
        <div style={styles.lectureGrid}>
          {lectures.map((lecture, index) => (
            <div
              key={lecture.lecture_id || `lecture-${index}`}
              style={styles.lectureCard}
            >
              <p>
                <strong>Professor ID:</strong> {lecture.professor_id}
              </p>
              <p>
                <strong>Course ID:</strong> {lecture.course_id}
              </p>
              <p>{lecture.content}</p>
            </div>
          ))}
        </div>
      )}

      {user.role === "Professor" && (
        <form onSubmit={handleAddLecture}>
          <h3>Add a New Lecture</h3>

          <div style={styles.formGroup}>
            <label htmlFor="lecture_subject">Lecture Subject:</label>
            <br />
            <input
              type="text"
              id="lecture_subject"
              value={lectureSubject}
              onChange={(e) => setLectureSubject(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="lecture_content">Lecture Content:</label>
            <br />
            <textarea
              id="lecture_content"
              value={lectureContent}
              onChange={(e) => setLectureContent(e.target.value)}
              required
              style={styles.textarea}
            />
          </div>

          <button type="submit" style={styles.button}>
            Add Lecture
          </button>
        </form>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center" as const,
  },
  errorText: {
    color: "red",
  },
  successText: {
    color: "green",
  },
  lectureGrid: {
    display: "grid",
    gap: "20px",
  },
  lectureCard: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  formGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    height: "100px",
  },
  button: {
    padding: "10px 20px",
  },
};

export default LecturePage;
