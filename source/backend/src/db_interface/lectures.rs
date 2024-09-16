use chrono::{DateTime, Utc};
use sqlx::{Pool, Postgres, Row, Transaction};

use crate::{entities::Lecture, DbInterfaceError};

pub async fn insert_lecture(
    tx: &mut Transaction<'_, Postgres>,
    post: &Lecture,
) -> Result<String, DbInterfaceError> {
    let query = r#"
    INSERT INTO lectures (lecture_id, course_id, professor_id, content)
    VALUES ($1, $2, $3, $4)
    RETURNING lecture_id
    "#;

    let row = sqlx::query(query)
        .bind(&post.lecture_id)
        .bind(&post.course_id)
        .bind(&post.professor_id)
        .bind(&post.content)
        .fetch_one(&mut **tx)
        .await?;

    let lecture_id = row.try_get("lecture_id")?;
    Ok(lecture_id)
}

pub async fn select_lectures_by_course_id(
    pool: &Pool<Postgres>,
    course_id: &String,
) -> Result<Vec<Lecture>, DbInterfaceError> {
    let query = r#"
    SELECT * FROM lectures
    WHERE course_id = $1
    "#;

    let rows = sqlx::query(query).bind(course_id).fetch_all(pool).await?;

    let posts = rows
        .iter()
        .map(|row| {
            Ok(Lecture {
                lecture_id: row.try_get("lecture_id")?,
                course_id: row.try_get("course_id")?,
                professor_id: row.try_get("professor_id")?,
                content: row.try_get("content")?,
                created_at: {
                    let time: DateTime<Utc> = row.try_get("created_at")?;
                    time.timestamp_millis().to_string()
                },
            })
        })
        .collect::<Result<Vec<Lecture>, DbInterfaceError>>()?;

    Ok(posts)
}

pub async fn select_lectures_by_enrolled_courses(
    pool: &Pool<Postgres>,
    student_id: &String,
) -> Result<Vec<Lecture>, DbInterfaceError> {
    let query = r#"
    SELECT lectures.*
    FROM lectures
    INNER JOIN courses ON lectures.course_id = courses.course_id
    WHERE $1 = ANY(courses.enrolled_ids)
    ORDER BY lectures.created_at DESC
    "#;

    let rows = sqlx::query(query).bind(student_id).fetch_all(pool).await?;

    let lectures = rows
        .iter()
        .map(|row| {
            Ok(Lecture {
                lecture_id: row.try_get("lecture_id")?,
                course_id: row.try_get("course_id")?,
                professor_id: row.try_get("professor_id")?,
                content: row.try_get("content")?,
                created_at: {
                    let time: DateTime<Utc> = row.try_get("created_at")?;
                    time.timestamp_millis().to_string()
                },
            })
        })
        .collect::<Result<Vec<Lecture>, DbInterfaceError>>()?;

    Ok(lectures)
}
