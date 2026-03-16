import type {MigrationConfig} from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
};

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;    
};

type DBConfig = {
    dbConnectionUrl: string;
    migrationConfig: MigrationConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) throw new Error(`Could not find ${key} env variable`);
    return value;
};

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/migrations"
};

export const config: Config = {
    api: {
        fileserverHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM")
    },
    db: {
        dbConnectionUrl: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig
    }
}