export interface ServerConfig {
    serverPort: number;
    serverAddress: string;
    mysql: MySqlConfig;
    public: string;

}

interface MySqlConfig {
    host: string;
    user: string;
    password: string;
    database: string;
}

