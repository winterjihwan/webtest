import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

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
  created_at: string;
}

const ActivityStreamPage: React.FC = () => {
  const location = useLocation();
  const user = location.state?.user as User;

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await axios.post(
          "https://webtest-g9ji.onrender.com/get_all_enrolled_lectures",
          {
            student_id: user.student_id,
          },
        );
        if (response.data && response.data.payload) {
          const sortedLectures = response.data.payload.sort(
            (a: Lecture, b: Lecture) =>
              Number(b.created_at) - Number(a.created_at),
          );
          setLectures(sortedLectures);
        } else {
          setErrorMessage("Failed to fetch activity stream. Data is empty.");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch activity stream.");
      }
    };

    fetchLectures();
  }, [user.student_id]);

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Activity Stream for {user.name}</h2>
      <p>Here are all the posts from your enrolled courses:</p>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {lectures.length === 0 ? (
        <p>No activity available</p>
      ) : (
        <div style={styles.lectureGrid}>
          {lectures.map((lecture, index) => (
            <div key={lecture.lecture_id} style={styles.lectureCard}>
              <p>
                <strong>Course ID:</strong> {lecture.course_id}
              </p>
              <p>
                <strong>Professor ID:</strong> {lecture.professor_id}
              </p>
              <p>{lecture.content}</p>
              <p style={{ fontSize: "12px", color: "gray" }}>
                Posted on: {lecture.created_at}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
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
};

export default ActivityStreamPage;
