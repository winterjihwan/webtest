use serde::{de::DeserializeOwned, Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiResponse<P> {
    pub error: Option<ApiErrorPayload>,
    pub payload: Option<P>,
}

impl<P: Serialize + DeserializeOwned> ApiResponse<P> {
    pub fn new_success(payload: P) -> ApiResponse<P> {
        ApiResponse {
            error: None,
            payload: Some(payload),
        }
    }

    pub fn new_error(note: String) -> ApiResponse<P> {
        ApiResponse {
            error: Some(ApiErrorPayload {
                code: "601".to_string(),
                msg: "-".to_string(),
                note: Some(note),
            }),
            payload: None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ApiErrorPayload {
    pub code: String,
    pub msg: String,
    pub note: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ApiErrorCode {
    pub code: String,
    pub msg: String,
}
