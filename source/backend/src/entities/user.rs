use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct User {
    pub username: String,
    pub password_hash: String,
    pub name: String,
    pub student_id: String,
    pub role: Role,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Role {
    Professor,
    Student,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SignUpUserRequest {
    pub user_name: String,
    pub password: String,
    pub name: String,
    pub student_id: String,
    pub role: Role,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SignInUserRequest {
    pub user_name: String,
    pub password: String,
}

impl Role {
    pub fn to_string(&self) -> &'static str {
        match self {
            Role::Professor => "professor",
            Role::Student => "student",
        }
    }

    pub fn from_str(s: &str) -> Role {
        match s {
            "professor" => Role::Professor,
            "student" => Role::Student,
            _ => panic!(),
        }
    }
}
