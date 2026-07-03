import { ServerConfig } from '../server-config';

export const config: ServerConfig = {
    serverPort: 3004,
    serverAddress: '0.0.0.0',
    mysql: {
        host: 'host.docker.internal',
        user: 'root',
        password: '',
        database: 'heroconfigurator'},
    public: 'public'
};