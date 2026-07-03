import * as express from 'express';
import { Routes } from './routes';
import bodyParser from 'body-parser';
import { DatabaseManager } from '../database/database';
import { UpdateRequest, UpdateResponse } from '../packet';
import { v4 as uuidv4 } from 'uuid';
import { Hero} from '../data';

export class HeroConfigurationController {
    private router: express.Router | null = null;
    constructor(private app: express.Application, private database: DatabaseManager) {
        this.initialize();
    }

    private initialize(): void {
            const jsonParser = bodyParser.json();
            this.router = express.Router(); 

        this.app.use(jsonParser);
        this.app.use(express.urlencoded({extended: true})); 

        this.app!.use('/api', this.router);

        this.router.post('/add-hero', jsonParser, async (request, response) => {
            try {
                const data: { data: Hero} = request.body; 

                if (!data.data.name || !data.data.attack || !data.data.defense || !data.data.specialSkillId) {
                    return response.status(400).json({ 
                        message: 'Missing data for hero', 
                        status: 'failed' 
                    } as UpdateResponse);
                }

                await this.database?.query({ 
                    tableName: 'heroes', 
                    object: {
                        name: data.data.name,
                        attack: data.data.attack,
                        defense: data.data.defense,
                        specialSkillId: data.data.specialSkillId, 
                        id: uuidv4()
                    } as Hero 
                } as UpdateRequest, 'create');   

                return response.status(201).json({ 
                    message: 'Hero added successfully', 
                    status: 'success' 
                } as UpdateResponse);

            } catch (error) {
                console.error('Error adding hero', error);
                return response.status(500).json({ 
                    message: 'Internal server error', 
                    status: 'failed' 
                } as UpdateResponse);
            }
        });

        this.router.post('/remove-hero', jsonParser, async (request, response) => {
            try {
            const data: { data: Hero} = request.body;

            if(!data.data.id) {
                return response.status(400).json({ message: 'Missing data for hero' });
            }

            await this.database?.query( { tableName: 'heroes', object: { id: data.data.id } as any } as UpdateRequest, 'delete');   

            return response.status(201).json({ message: 'Hero removed successfully', status: 'success' } as UpdateResponse);

            } catch(error) {
                console.error('Error removing hero');
                return response.status(500).json({ message: 'Internal server error', status: 'failed' } as UpdateResponse);
            }
        });

        this.router.post('/update-hero', jsonParser, async (request, response) => {
            try {
            const data: {data: Hero } = request.body;

            if(!data.data.id || !data.data.name || !data.data.attack || !data.data.defense || !data.data.specialSkillId) {
                return response.status(400).json({ message: 'Missing data for hero', status: 'failed' } as UpdateResponse);
            }

             const existingHeroes: Hero[] = await this.database.query({ tableName: 'heroes' } as UpdateRequest, 'read');

             const existingHero = existingHeroes.find(h => h.id === data.data.id);

             if(!existingHero) {
                return response.status(400).json({ message: 'Trying to edit non-existent hero', status: 'failed' } as UpdateResponse);
            }

            await this.database?.query( { tableName: 'heroes', object: { 
                id: data.data.id,
                name: data.data.name, 
                attack: data.data.attack,
                defense: data.data.defense,
                specialSkillId: data.data.specialSkillId
            } as Hero } as UpdateRequest, 'update');   

            return response.status(201).json({ message: 'Hero updated successfully', status: 'success' } as UpdateResponse);

            } catch(error) {
                console.error('Error registering user');
                return response.status(500).json({ message: 'Internal server error', status: 'failed' } as UpdateResponse);
            }
        });
    
        this.router.get('/get-heroes', jsonParser, async (request, response) => {
            try {
                const data: Hero[] = await this.database.query({ tableName: 'heroes' } as UpdateRequest, 'read');

                response.send({ 
                    status: 'success',
                    payload: data
                 } as UpdateResponse);
            } catch(exception) {
                response.send({ 
                    status: 'failed'
                 } as UpdateResponse);
            }
          });
    }
}