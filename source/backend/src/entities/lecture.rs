use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Lecture {
    pub lecture_id: String,
    pub course_id: String,
    pub professor_id: String,
    pub content: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize)]
pub struct AddLectureRequest {
    pub lecture_id: String,
    pub course_id: String,
    pub professor_id: String,
    pub content: String,
}

#[derive(Serialize, Deserialize)]
pub struct GetLecturesRequest {
    pub course_id: String,
}

#[derive(Serialize, Deserialize)]
pub struct GetAllEnrolledLecturesRequest {
    pub student_id: String,
}
