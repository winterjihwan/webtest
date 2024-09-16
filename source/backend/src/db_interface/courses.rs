use crate::{entities::Course, DbInterfaceError};
use sqlx::{Pool, Postgres, Row, Transaction};

pub async fn insert_course(
    tx: &mut Transaction<'_, Postgres>,
    course: &Course,
) -> Result<i64, DbInterfaceError> {
    let query = r#"
    INSERT INTO courses (course_id, professor_id, course_name, enrolled_ids)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    "#;

    let row = sqlx::query(query)
        .bind(&course.course_id)
        .bind(&course.professor_id)
        .bind(&course.course_name)
        .bind(&course.enrolled_ids)
        .fetch_one(&mut **tx)
        .await?;

    let course_id: i64 = row.try_get("id")?;
    Ok(course_id)
}

pub async fn select_courses_by_professor_id(
    pool: &Pool<Postgres>,
    professor_id: &String,
) -> Result<Vec<Course>, DbInterfaceError> {
    let query = r#"
    SELECT * FROM courses
    WHERE professor_id = $1
    "#;

    let rows = sqlx::query(query)
        .bind(professor_id)
        .fetch_all(pool)
        .await?;

    let courses = rows
        .iter()
        .map(|row| {
            Ok(Course {
                course_id: row.try_get("course_id")?,
                professor_id: row.try_get("professor_id")?,
                course_name: row.try_get("course_name")?,
                enrolled_ids: row.try_get("enrolled_ids")?,
            })
        })
        .collect::<Result<Vec<Course>, DbInterfaceError>>()?;

    Ok(courses)
}

pub async fn select_all_courses(pool: &Pool<Postgres>) -> Result<Vec<Course>, DbInterfaceError> {
    let query = r#"
    SELECT * FROM courses
    "#;

    let rows = sqlx::query(query).fetch_all(pool).await?;

    let courses = rows
        .iter()
        .map(|row| {
            Ok(Course {
                course_id: row.try_get("course_id")?,
                professor_id: row.try_get("professor_id")?,
                course_name: row.try_get("course_name")?,
                enrolled_ids: row.try_get("enrolled_ids")?,
            })
        })
        .collect::<Result<Vec<Course>, DbInterfaceError>>()?;

    Ok(courses)
}

pub async fn insert_student_in_enrolled_ids(
    tx: &mut Transaction<'_, Postgres>,
    course_id: &String,
    student_id: &String,
) -> Result<(), DbInterfaceError> {
    let query = r#"
    UPDATE courses
    SET enrolled_ids = array_append(enrolled_ids, $2)
    WHERE course_id = $1
    "#;

    sqlx::query(query)
        .bind(course_id)
        .bind(student_id)
        .execute(&mut **tx)
        .await?;

    Ok(())
}

pub async fn select_courses_by_student_id(
    pool: &Pool<Postgres>,
    student_id: &String,
) -> Result<Vec<Course>, DbInterfaceError> {
    let query = r#"
    SELECT * FROM courses
    WHERE $1 = ANY(enrolled_ids)
    "#;

    let rows = sqlx::query(query).bind(student_id).fetch_all(pool).await?;

    let courses = rows
        .iter()
        .map(|row| {
            Ok(Course {
                course_id: row.try_get("course_id")?,
                professor_id: row.try_get("professor_id")?,
                course_name: row.try_get("course_name")?,
                enrolled_ids: row.try_get("enrolled_ids")?,
            })
        })
        .collect::<Result<Vec<Course>, DbInterfaceError>>()?;

    Ok(courses)
}

pub async fn remove_student_from_enrolled_ids(
    tx: &mut Transaction<'_, Postgres>,
    course_id: &String,
    student_id: &String,
) -> Result<(), DbInterfaceError> {
    let query = r#"
    UPDATE courses
    SET enrolled_ids = array_remove(enrolled_ids, $2)
    WHERE course_id = $1
    "#;

    sqlx::query(query)
        .bind(course_id)
        .bind(student_id)
        .execute(&mut **tx)
        .await?;

    Ok(())
}
