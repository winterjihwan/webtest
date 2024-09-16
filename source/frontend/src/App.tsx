import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/homePage";
import SignupPage from "./pages/signupPage";
import SigninPage from "./pages/signinPage";
import StudentPage from "./pages/studentPage";
import ProfessorPage from "./pages/professorPage";
import LecturePage from "./pages/lecturePage";
import ActivityStreamPage from "./pages/activityStreamPage";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/student" element={<StudentPage />} />
          <Route path="/professor" element={<ProfessorPage />} />
          <Route path="/lecturePage/:courseId" element={<LecturePage />} />
          <Route path="/activityStream" element={<ActivityStreamPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
