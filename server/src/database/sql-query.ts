import { RequestType, UpdateRequest } from "../packet";

enum MySqlQueryIndex {
    UPDATE = 0,
    CREATE,
    READ,
    DELETE,
    NUM_INDICES
}

const sqlQueryTable: string[] = [
    'UPDATE {tableName} SET {variables} WHERE id = {id}',
    'INSERT INTO {tableName} ({variableList}) VALUES ({variableValues});',       
    'SELECT * FROM {tableName};',
    'DELETE FROM {tableName} WHERE id = {id};'
];

function getObjectKeys(object: any, withId: boolean): string[] {
    const keys = Object.keys(object);
    if(withId) {
        return keys;
    } else {
        delete keys['id' as any];
        return keys;
    }
}

function generateReadQuery(tableName: string) {
    const sqlQuery = sqlQueryTable[MySqlQueryIndex.READ];
    return sqlQuery!.replace(`{tableName}`, tableName);
}

function generateDeleteQuery(tableName: string, object: any, id?: number) {
    let sqlQuery = sqlQueryTable[MySqlQueryIndex.DELETE];
    if(!id && !object['id']) {
        throw new Error("Update delete without id.");
    }

    sqlQuery = sqlQuery!.replace('{id}', (typeof object['id'] === 'string' ? `'${object['id']}'` : `${object['id']}` || id) as string) ;
    return sqlQuery.replace(`{tableName}`, tableName).replace(`{id}`, object['id'] || id);
}

function generateInsertQuery(object: any, tableName: string) {
    let sqlQuery = sqlQueryTable[MySqlQueryIndex.CREATE];
    sqlQuery = sqlQuery!.replace(`{tableName}`, tableName);
    const keys = getObjectKeys(object, false);

    let variableList = '';
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        variableList += `${key}${i < keys.length - 1 ? ',' : ''}`;
    }
    sqlQuery = sqlQuery.replace(`{variableList}`, variableList);

    let variableValues = '';
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key as any];

        if(typeof value === 'number') {
            variableValues += `\'${value}\'${i < keys.length - 1 ? ',' : ''}`;
        } else if(value instanceof Date) {
            variableValues += `'${dateToMySqlDate(value)}'${i < keys.length - 1 ? ', ' : ''}`;
        } else if(typeof value === 'string') {
            variableValues += `\'${value}\'${i < keys.length - 1 ? ',' : ''}`;
        }else if(value === null) {
            variableValues += `${'NULL'}${i < keys.length - 1 ? ', ' : ''}`;

        } else {
            variableValues += `${value}${i < keys.length - 1 ? ', ' : ''}`;
        }
    }
    sqlQuery = sqlQuery.replace(`{variableValues}`, variableValues);
    return sqlQuery;
}

function dateToMySqlDate(dateString: Date) {
    return dateString.toISOString().slice(0,19).replace('T', ' ');
}

function generateUpdateQuery(object: any, tableName: string, id?: number) {
    let overWriteQuery = '';
    if (object.oldId) {
        const oldId = object.oldId;
        let deleteOld = generateDeleteQuery(tableName, object);
        delete object.oldId;
        let overWriteQuery = generateInsertQuery(object, tableName);
        overWriteQuery = deleteOld + overWriteQuery;


        return overWriteQuery;
    }

    let sqlQuery = sqlQueryTable[MySqlQueryIndex.UPDATE];
    sqlQuery = sqlQuery!.replace(`{tableName}`, tableName);
    if(!id && !object['id']) {
        throw new Error("Update called without id.");
    }
    let variables = '';
    const keys: string[] = getObjectKeys(object, !(!id));
    for(let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = object[key as any];
        if(typeof value === 'number') {
            variables += `${key} = \'${value}\'${i < keys.length - 1 ? ',' : ''}`;
        }else if(value instanceof Date) {
            variables += `${key} = '${dateToMySqlDate(value)}'${i < keys.length - 1 ? ', ' : ''}`;
        }else if(typeof value === 'string') {
            variables += `${key} = \'${value}\'${i < keys.length - 1 ? ',' : ''}`;
        } else {
            variables += `${key} = ${value}${i < keys.length - 1 ? ',' : ''}`;
        }
    }
    sqlQuery = sqlQuery.replace('{variables}', variables);
    sqlQuery = sqlQuery.replace('{id}', (typeof object['id'] === 'string' ? `'${object['id']}'` : `${object['id']}` || id) as string) ;
    return sqlQuery;
}

export function getMySqlQuery(request: RequestType, data: UpdateRequest): string | null {
    switch(request) {
        case 'update': 
            return generateUpdateQuery(data.object, data.tableName, data.id);
        case 'create':
            return generateInsertQuery(data.object, data.tableName);
        case 'read':
            return generateReadQuery(data.tableName);
        case 'delete':
            return generateDeleteQuery(data.tableName, data.object, data.id);
    }
}