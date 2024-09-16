use lazy_static::lazy_static;
use serde::Deserialize;

lazy_static! {
    pub static ref ENVS: Envs = Envs::new();
}

#[derive(Deserialize, Debug)]
pub struct Envs {
    pub db_endpoint: String,
    pub db_username: String,
    pub db_password: String,
}

impl Envs {
    pub fn new() -> Envs {
        let db_endpoint = std::env::var("DB_ENDPOINT").expect("Db endpoint not provided");
        let db_username = std::env::var("DB_USERNAME").expect("Db username not provided");
        let db_password = std::env::var("DB_PASSWORD").expect("Db password not provided");

        Envs {
            db_endpoint,
            db_username,
            db_password,
        }
    }
}
