mod db;
mod db_interface;
mod entities;
mod envs;
mod errors;
mod response;
mod router;

use axum::{
    http::{HeaderValue, Method},
    routing::{get, post},
    Router,
};
use db::{init_db, Database};
pub use envs::*;
pub use errors::*;
pub use router::*;
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

pub struct ServerState {
    db: Arc<Database>,
}

#[tokio::main]
async fn main() {
    let db = init_db().await;

    let app_state = Arc::new(ServerState { db });

    let app = Router::new()
        .route("/", get(root))
        .route("/signup", post(signup))
        .route("/signin", post(signin))
        .route("/add_course", post(add_course))
        .route("/get_courses", post(get_courses_by_professor))
        .route("/add_lecture", post(add_lecture))
        .route("/get_lectures", post(get_lectures_by_course))
        .route("/get_all_courses", post(get_all_courses))
        .route("/enroll", post(enroll_in_course))
        .route("/get_enrolled_courses", post(get_enrolled_courses))
        .route("/remove_student", post(remove_student))
        .route(
            "/get_all_enrolled_lectures",
            post(get_all_enrolled_lectures),
        )
        .layer(
            CorsLayer::new()
                .allow_origin("*".parse::<HeaderValue>().unwrap())
                .allow_headers(Any)
                .allow_methods([Method::GET, Method::POST]),
        )
        .with_state(app_state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 4500));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    let local_addr = listener.local_addr().unwrap();

    println!("Listening on {}", local_addr.to_string());

    axum::serve(listener, app).await.unwrap();
}
