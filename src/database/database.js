import * as SQLite from 'expo-sqlite';

let db;

// Função para abrir o banco de dados corretamente
export const setupDatabase = async () => {
    db = await SQLite.openDatabaseAsync('routes.db');

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            distancia REAL NOT NULL
        );
    `);

    console.log('banco de dados novo criado')
};

// Função para salvar a coordenada
export const saveRouteToDB = async (latitude, longitude, distancia) => {
    if (!db) return;
    await db.runAsync(
        'INSERT INTO routes (latitude, longitude, distancia) VALUES (?, ?, ?)',
        latitude, longitude, distancia
    );
};

// Função para carregar as coordenadas
export const loadRouteFromDB = async () => {
    if (!db) return [];
    return await db.getAllAsync('SELECT * FROM routes');
};

// Função para limpar as rotas
export const clearRouteDB = async () => {
    if (!db) return;
    await db.runAsync('DELETE FROM routes');
    return 'ok'
};
