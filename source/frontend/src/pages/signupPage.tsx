import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SignUpUserRequest {
  user_name: string;
  password: string;
  name: string;
  student_id: string;
  role: "Professor" | "Student";
}

const Signup: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<"Professor" | "Student">("Student");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSignup = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const signupData: SignUpUserRequest = {
        user_name: userName,
        password: password,
        name: name,
        student_id: id,
        role: role,
      };

      try {
        const response = await axios.post(
          "http://localhost:4500/signup",
          signupData,
        );
        setSuccessMessage("Signup successful!");
        setErrorMessage(null);

        console.log("Response: ", response.data);
        navigate("/");
      } catch (error) {
        setErrorMessage("Error occurred during signup.");
        setSuccessMessage(null);
      }
    },
    [userName, password, name, id, role, navigate],
  );

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}
      {successMessage && <p style={styles.successText}>{successMessage}</p>}

      <form onSubmit={handleSignup}>
        <div style={styles.inputContainer}>
          <label htmlFor="user_name">Username:</label>
          <br />
          <input
            type="text"
            id="user_name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputContainer}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputContainer}>
          <label htmlFor="name">Name:</label>
          <br />
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputContainer}>
          <label htmlFor="id">
            {role === "Student" ? "Student ID" : "Professor ID"}:
          </label>
          <br />
          <input
            type="text"
            id="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputContainer}>
          <label>Role:</label>
          <br />
          <div>
            <input
              type="radio"
              id="student"
              value="Student"
              checked={role === "Student"}
              onChange={() => setRole("Student")}
            />
            <label htmlFor="student">Student</label>
          </div>
          <div>
            <input
              type="radio"
              id="professor"
              value="Professor"
              checked={role === "Professor"}
              onChange={() => setRole("Professor")}
            />
            <label htmlFor="professor">Professor</label>
          </div>
        </div>

        <button type="submit" style={styles.button}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    textAlign: "center" as const,
    maxWidth: "400px",
    margin: "0 auto",
  },
  inputContainer: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "8px",
  },
  button: {
    padding: "10px 20px",
  },
  errorText: {
    color: "red",
  },
  successText: {
    color: "green",
  },
};

export default Signup;
