//Hold the numberof requests received by the app
type APIConfig = {
    fileserverHits: number;
    dbURL: string;
};


process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) throw new Error(`Could not find ${key} env variable`);
    return value;
};

//Hold stateful data
export const config: APIConfig = {
    fileserverHits: 0,
    dbURL: envOrThrow("DB_URL")
}