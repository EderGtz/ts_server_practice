import type {MigrationConfig} from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
    jwt: JWTConfig;
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

type JWTConfig = {
    defaultDuration: number;
    defaultDurationRefreshToken: Date;
    secret: string;
    issuer: string;
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
        platform: envOrThrow("PLATFORM"),
    },
    db: {
        dbConnectionUrl: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
    jwt: {
        defaultDuration: 60 * 60, // 1 hour in seconds,
        defaultDurationRefreshToken: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000), //60 days from now
        secret: envOrThrow("SECRET_JWT_SIGN"),
        issuer: "chirpy"
    }
}