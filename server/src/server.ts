import express from 'express';
import * as exp from 'express';
import path from 'path';
import cors from 'cors';
import { config } from './environment/config/config';
import http from 'http';
import { Routes } from './controllers/routes'
import { DatabaseManager } from './database/database';
import { HeroConfigurationController } from './controllers/hero-controller';


export class HeroConfiguratorServer {
    public static readonly PORT: number = config.serverPort || 3004;
    private app: exp.Application | null = null;
    private port: string | number = '';
    private server: http.Server | null = null;
    private database: DatabaseManager | null = null;   
    private heroConfigurationController: HeroConfigurationController | null = null;
    private servicesInitialized:  boolean = false;

    constructor() {
    }

    public async initialize(): Promise<void> {
        this.createApp();
        this.configure();
        this.createServer(); 
        await this.initializeBackendServices();
        this.listen();
    }

    private initializeControllers() : void {
        this.heroConfigurationController = new HeroConfigurationController(this.app!, this.database!);

         const publicPath = process.env.NODE_ENV === 'production'
            ? '/app/client/dist/dist'  
            : path.join(__dirname, '../../client/dist');

       this.app!.use(cors({ origin: `http://${config.serverAddress}:${config.serverPort}`}))

       this.app!.use(express.static(config.public.length > 0 ? path.join(__dirname, config.public) : __dirname));
       this.app!.use(express.static(publicPath));
       
       this.app!.get(Routes.HOME, (req, res) => {
            res.sendFile(__dirname + (config.public.length > 0 ? `/${config.public}/index.html` : 'index.html'));
          });

        this.app!.get('*path', (req, res) => {
           res.sendFile(__dirname + (config.public.length > 0 ? `/${config.public}/index.html` : 'index.html'));
        });
    }

    private async initializeBackendServices(): Promise<void> {
        try {
            this.database = new DatabaseManager();
            this.servicesInitialized = await this.database!.initConnection();
            this.initializeControllers();   
        } catch(error) {
            console.log('Error initializing backend services');
            this.servicesInitialized = false;
        }
    }


    private createApp(): void {
       this.app = express();
    }

    private configure(): void {
        this.port = process.env.PORT || config.serverPort || HeroConfiguratorServer.PORT;
    }

    private listen(): void {
        console.log('Services inited', this.servicesInitialized);
        if(!this.servicesInitialized) {
            return;
        }
        this.server!.listen(this.port, () => {
            console.log('Running data server on port %s', this.port);
        });
    }

    private createServer(): void {
        this.server = http.createServer( this.app!);
    }
}
