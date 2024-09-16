mod auth;
mod course;
mod lecture;

pub use auth::*;
pub use course::*;
pub use lecture::*;

pub async fn root() -> &'static str {
    "Root"
}
