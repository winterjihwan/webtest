use crate::{
    db_interface::{insert_user, select_user_by_username},
    entities::{SignInUserRequest, SignUpUserRequest, User},
    response::ApiResponse,
};
use axum::{extract::State, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use std::sync::Arc;

use crate::ServerState;

pub async fn signup(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<SignUpUserRequest>,
) -> Json<ApiResponse<String>> {
    let pool = &state.db.pool;
    let mut tx = pool.begin().await.unwrap();

    let hashed_password = match hash_password(&input.password) {
        Ok(hash) => hash,
        Err(_) => {
            return Json(ApiResponse::new_error(
                "Failed to hash password".to_string(),
            ))
        }
    };

    let username = match insert_user(
        &mut tx,
        &User {
            name: input.name,
            student_id: input.student_id,
            username: input.user_name,
            password_hash: hashed_password,
            role: input.role,
        },
    )
    .await
    {
        Ok(us) => us,
        Err(err) => {
            println!("ERROR: {}", err.to_string());
            return Json(ApiResponse::new_error(err.to_string()));
        }
    };

    tx.commit().await.unwrap();

    println!("Sign up success, payload: {}", username);
    Json(ApiResponse::new_success(username))
}

pub async fn signin(
    State(state): State<Arc<ServerState>>,
    Json(input): Json<SignInUserRequest>,
) -> Json<ApiResponse<User>> {
    let pool = &state.db.pool;

    let user = match select_user_by_username(&pool, &input.user_name).await {
        Ok(Some(user)) => user,
        Ok(None) => return Json(ApiResponse::new_error("User does not exist".to_string())),
        Err(err) => {
            return Json(ApiResponse::new_error(format!(
                "Error fetching user data from DB, {}",
                err.to_string()
            )));
        }
    };

    if verify_password(&input.password, &user.password_hash).unwrap() {
        println!("Sign in success, user: {}", user.username);
        Json(ApiResponse::new_success(user))
    } else {
        Json(ApiResponse::new_error(
            "Invalid username or password".to_string(),
        ))
    }
}

fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    let hashed = hash(password, DEFAULT_COST)?;
    Ok(hashed)
}

fn verify_password(password: &str, hashed: &str) -> Result<bool, bcrypt::BcryptError> {
    Ok(verify(password, hashed)?)
}
