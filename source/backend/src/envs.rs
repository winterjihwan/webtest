use lazy_static::lazy_static;
use serde::Deserialize;
use std::path::Path;

lazy_static! {
    pub static ref ENVS: Envs = Envs::new();
}

const CRATE_PATH: &'static str = "source/backend";

#[derive(Deserialize, Debug)]
pub struct Envs {
    pub db_endpoint: String,
    pub db_username: String,
    pub db_password: String,
}

impl Envs {
    pub fn new() -> Envs {
        let env_path = Path::new(CRATE_PATH).join(format!(".env"));

        dotenvy::from_path(&env_path).expect(&format!(
            "{}, Failed to locate .env, path: {:?}",
            env!("CARGO_PKG_NAME"),
            env_path
        ));

        match envy::from_env::<Envs>() {
            Ok(envs) => {
                println!("Loaded dot env,  env: {:?}", envs);

                return envs;
            }
            Err(error) => panic!("Dot env is invalid, {:#?}", error),
        };
    }
}
