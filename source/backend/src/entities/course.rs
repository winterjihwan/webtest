use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Course {
    pub professor_id: String,
    pub course_id: String,
    pub course_name: String,
    pub enrolled_ids: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct AddCourseRequest {
    pub professor_id: String,
    pub course_id: String,
    pub course_name: String,
    pub enrolled_ids: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct GetCoursesRequest {
    pub professor_id: String,
}

#[derive(Deserialize)]
pub struct EnrollRequest {
    pub course_id: String,
    pub student_id: String,
}

#[derive(Deserialize)]
pub struct GetStudentCoursesRequest {
    pub student_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct RemoveStudentRequest {
    pub course_id: String,
    pub student_id: String,
}
