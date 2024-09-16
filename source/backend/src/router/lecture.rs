use crate::{
    db_interface::{
        insert_lecture, select_lectures_by_course_id, select_lectures_by_enrolled_courses,
    },
    entities::{AddLectureRequest, GetAllEnrolledLecturesRequest, GetLecturesRequest, Lecture},
    response::ApiResponse,
    ServerState,
};
use axum::{extract::State, Json};
use chrono::Utc;
use std::sync::Arc;

pub async fn add_lecture(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<AddLectureRequest>,
) -> Json<ApiResponse<String>> {
    let pool = &state.db.pool;
    let mut tx = pool.begin().await.unwrap();

    let lecture_id = match insert_lecture(
        &mut tx,
        &Lecture {
            lecture_id: input.lecture_id.clone(),
            course_id: input.course_id.clone(),
            professor_id: input.professor_id.clone(),
            content: input.content.clone(),
            created_at: Utc::now().to_string(),
        },
    )
    .await
    {
        Ok(id) => {
            println!("Success adding lecture {}", id);
            id
        }
        Err(err) => {
            println!("Error while adding lecture: {}", err.to_string());
            return Json(ApiResponse::new_error(format!(
                "Failed to add lecture post: {}",
                err.to_string()
            )));
        }
    };

    tx.commit().await.unwrap();
    Json(ApiResponse::new_success(lecture_id))
}

pub async fn get_lectures_by_course(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<GetLecturesRequest>,
) -> Json<ApiResponse<Vec<Lecture>>> {
    let pool = &state.db.pool;

    let lectures = match select_lectures_by_course_id(pool, &input.course_id).await {
        Ok(lectures) => lectures,
        Err(err) => {
            println!("ERROR, while getting courses: {}", err.to_string());
            return Json(ApiResponse::new_error(format!(
                "Failed to retrieve lecture posts: {}",
                err.to_string()
            )));
        }
    };

    Json(ApiResponse::new_success(lectures))
}

pub async fn get_all_enrolled_lectures(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<GetAllEnrolledLecturesRequest>,
) -> Json<ApiResponse<Vec<Lecture>>> {
    let pool = &state.db.pool;

    let lectures = match select_lectures_by_enrolled_courses(pool, &input.student_id).await {
        Ok(lectures) => lectures,
        Err(err) => {
            println!("ERROR while fetching lectures: {}", err.to_string());

            return Json(ApiResponse::new_error(format!(
                "Failed to retrieve lectures: {}",
                err.to_string()
            )));
        }
    };

    Json(ApiResponse::new_success(lectures))
}
