use crate::{
    entities::{Role, User},
    DbInterfaceError,
};
use sqlx::{self, Pool, Postgres, Row, Transaction};

pub async fn select_user_by_username(
    pool: &Pool<Postgres>,
    username: &String,
) -> Result<Option<User>, DbInterfaceError> {
    let query = r#"
    SELECT * FROM users
    WHERE username=$1
    "#;

    let row = sqlx::query(query)
        .bind(username)
        .fetch_optional(pool)
        .await?;

    match row {
        Some(row) => {
            let role: String = row.try_get("role")?;
            let user = User {
                username: row.try_get("username")?,
                password_hash: row.try_get("password_hash")?,
                name: row.try_get("name")?,
                student_id: row.try_get("student_id")?,
                role: Role::from_str(&role),
            };
            Ok(Some(user))
        }
        None => Ok(None),
    }
}

pub async fn insert_user(
    tx: &mut Transaction<'_, Postgres>,
    user: &User,
) -> Result<String, DbInterfaceError> {
    let query = r#"
    INSERT INTO users (username, password_hash, name, student_id, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING username
    "#;

    let row = sqlx::query(query)
        .bind(&user.username)
        .bind(&user.password_hash)
        .bind(&user.name)
        .bind(&user.student_id)
        .bind(user.role.to_string())
        .fetch_one(&mut **tx)
        .await?;

    let username = row.try_get("username")?;
    Ok(username)
}
