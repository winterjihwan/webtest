import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SignInUserRequest {
  user_name: string;
  password: string;
}

interface User {
  username: string;
  password_hash: string;
  name: string;
  student_id: string;
  role: "Professor" | "Student";
}

const SignIn: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSignIn = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const signInData: SignInUserRequest = {
        user_name: userName,
        password: password,
      };

      try {
        const response = await axios.post(
          "https://webtest-g9ji.onrender.com/signin",
          signInData,
        );
        const user: User = response.data.payload;

        console.log("Response data: ", response.data.payload);

        if (user.role === "Student") {
          navigate("/student", { state: { user } });
        } else if (user.role === "Professor") {
          navigate("/professor", { state: { user } });
        }
      } catch (error) {
        setErrorMessage("Invalid username or password.");
      }
    },
    [userName, password, navigate],
  );

  return (
    <div style={styles.container}>
      <h2>Sign In</h2>
      {errorMessage && <p style={styles.errorText}>{errorMessage}</p>}

      <form onSubmit={handleSignIn}>
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

        <button type="submit" style={styles.button}>
          Sign In
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
};

export default SignIn;
