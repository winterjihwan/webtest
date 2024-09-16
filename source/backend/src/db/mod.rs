use sqlx::{
    postgres::{PgConnectOptions, PgPoolOptions, PgSslMode},
    ConnectOptions, Pool, Postgres,
};
use std::sync::Arc;

use crate::{envs::ENVS, errors::ApiServerError};

const DB_NAME: &str = "blackboard";
const PORT: u16 = 5432;

pub struct Database {
    pub pool: Pool<Postgres>,
}

impl Database {
    pub async fn connect(
        endpoint: &String,
        username: &String,
        pw: &String,
    ) -> Result<Database, ApiServerError> {
        let connect_options = PgConnectOptions::new()
            .username(username)
            .password(pw)
            .port(PORT)
            .host(endpoint)
            .database(DB_NAME)
            .ssl_mode(PgSslMode::Prefer);

        let url = connect_options.to_url_lossy();

        let pool = PgPoolOptions::new()
            .connect_with(connect_options)
            .await
            .expect(&format!("url: {}", url));

        let d = Database { pool };

        return Ok(d);
    }
}

pub async fn init_db() -> Arc<Database> {
    let db = {
        let pg_endpoint = &ENVS.db_endpoint;
        let pg_username = &ENVS.db_username;
        let pg_password = &ENVS.db_password;

        let db = Database::connect(pg_endpoint, pg_username, pg_password)
            .await
            .unwrap();
        Arc::new(db)
    };

    db
}
