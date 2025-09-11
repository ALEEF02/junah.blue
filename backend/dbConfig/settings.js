// TODO: replace with .env variablesdo i ha
export const mongoConfig = {
    serverUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: 'fakeDb'
}