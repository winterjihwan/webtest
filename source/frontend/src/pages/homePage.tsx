import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div style={styles.container}>
      <h2>Blackboard</h2>
      <Link to="/signin" style={styles.button}>
        Sign in
      </Link>
      <Link to="/signup" style={styles.button}>
        Sign up
      </Link>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center" as const,
    marginTop: "50px",
  },
  button: {
    margin: "10px",
    padding: "10px 20px",
    textDecoration: "none",
    color: "white",
    backgroundColor: "#007bff",
    borderRadius: "5px",
  },
};
