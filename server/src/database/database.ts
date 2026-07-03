import * as mysql from 'mysql2';
import { RequestType, UpdateRequest } from '../packet';
import { config } from '../environment/config/config';
import { getMySqlQuery } from './sql-query';

export class DatabaseManager {

    constructor() {
    }

    private async querySql(query: string) {
        const promise = new Promise<any>((resolve, reject) => {
            this.connection!.query(
                query, (err, results) => {
                if(err) throw err;
                resolve(results as any); 
          });
        });
        return promise;
    }

    public initConnection(): Promise<boolean> {
        const promise = new Promise<boolean>((resolve, reject) => {
            this.connection = mysql.createConnection(config.mysql);
             this.connection.connect((err) => {
                  if (err){
                    resolve(false);
                }      
                 resolve(true);
            });
        });

        return promise;
    }

    public async query(request: UpdateRequest, requestType: RequestType) {
        const query = getMySqlQuery(requestType, request);
        if(query == null) {
            return null;
        }
        return await this.querySql(query);
    }

    private connection: mysql.Connection | null = null;
}