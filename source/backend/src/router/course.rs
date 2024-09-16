use crate::{
    db_interface::{
        insert_course, insert_student_in_enrolled_ids, remove_student_from_enrolled_ids,
        select_all_courses, select_courses_by_professor_id, select_courses_by_student_id,
    },
    entities::{
        AddCourseRequest, Course, EnrollRequest, GetCoursesRequest, GetStudentCoursesRequest,
        RemoveStudentRequest,
    },
    response::ApiResponse,
    ServerState,
};
use axum::{extract::State, Json};
use std::sync::Arc;

pub async fn add_course(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<AddCourseRequest>,
) -> Json<ApiResponse<i64>> {
    let pool = &state.db.pool;
    let mut tx = pool.begin().await.unwrap();

    let course_id = match insert_course(
        &mut tx,
        &Course {
            course_id: input.course_id,
            professor_id: input.professor_id,
            course_name: input.course_name,
            enrolled_ids: input.enrolled_ids,
        },
    )
    .await
    {
        Ok(id) => id,
        Err(err) => {
            println!("ERROR, while adding course: {}", err.to_string());

            return Json(ApiResponse::new_error(format!(
                "Failed to add course: {}",
                err.to_string()
            )));
        }
    };

    tx.commit().await.unwrap();

    Json(ApiResponse::new_success(course_id))
}

pub async fn get_courses_by_professor(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<GetCoursesRequest>,
) -> Json<ApiResponse<Vec<Course>>> {
    let pool = &state.db.pool;

    let courses = match select_courses_by_professor_id(pool, &input.professor_id).await {
        Ok(courses) => courses,
        Err(err) => {
            println!("ERROR, while fetching courses: {}", err.to_string());

            return Json(ApiResponse::new_error(format!(
                "Failed to retrieve courses: {}",
                err.to_string()
            )));
        }
    };

    Json(ApiResponse::new_success(courses))
}

pub async fn get_all_courses(
    State(state): State<Arc<ServerState>>,
) -> Json<ApiResponse<Vec<Course>>> {
    let pool = &state.db.pool;

    let courses = match select_all_courses(pool).await {
        Ok(courses) => courses,
        Err(err) => {
            println!("ERROR, while fetching courses: {}", err.to_string());
            return Json(ApiResponse::new_error(format!(
                "Failed to retrieve courses: {}",
                err.to_string()
            )));
        }
    };

    Json(ApiResponse::new_success(courses))
}

pub async fn enroll_in_course(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<EnrollRequest>,
) -> Json<ApiResponse<()>> {
    let pool = &state.db.pool;
    let mut tx = pool.begin().await.unwrap();

    match insert_student_in_enrolled_ids(&mut tx, &input.course_id, &input.student_id).await {
        Ok(_) => {
            tx.commit().await.unwrap();
            Json(ApiResponse::new_success(()))
        }
        Err(err) => {
            println!("ERROR, while enrolling student: {}", err.to_string());
            Json(ApiResponse::new_error(format!(
                "Failed to enroll in course: {}",
                err.to_string()
            )))
        }
    }
}

pub async fn get_enrolled_courses(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<GetStudentCoursesRequest>,
) -> Json<ApiResponse<Vec<Course>>> {
    let pool = &state.db.pool;

    let courses = match select_courses_by_student_id(pool, &input.student_id).await {
        Ok(courses) => courses,
        Err(err) => {
            println!(
                "ERROR, while fetching enrolled courses: {}",
                err.to_string()
            );

            return Json(ApiResponse::new_error(format!(
                "Failed to retrieve enrolled courses: {}",
                err.to_string()
            )));
        }
    };

    Json(ApiResponse::new_success(courses))
}

pub async fn remove_student(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<RemoveStudentRequest>,
) -> Json<ApiResponse<()>> {
    let pool = &state.db.pool;
    let mut tx = pool.begin().await.unwrap();

    match remove_student_from_enrolled_ids(&mut tx, &input.course_id, &input.student_id).await {
        Ok(_) => {
            tx.commit().await.unwrap();
            Json(ApiResponse::new_success(()))
        }
        Err(err) => {
            println!("ERROR, while removing student: {}", err.to_string());
            Json(ApiResponse::new_error(format!(
                "Failed to remove student from course: {}",
                err.to_string()
            )))
        }
    }
}
