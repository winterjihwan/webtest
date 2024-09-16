pub type DbInterfaceError = Box<dyn std::error::Error + Send + Sync>;

pub type ApiServerError = Box<dyn std::error::Error + Send + Sync>;
