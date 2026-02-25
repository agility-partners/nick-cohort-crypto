IF DB_ID('CoinSightDB') IS NULL
BEGIN
    CREATE DATABASE CoinSightDB;
END;
GO

USE CoinSightDB;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.schemas
    WHERE name = 'bronze'
)
BEGIN
    EXEC('CREATE SCHEMA bronze');
END;
GO

IF OBJECT_ID('bronze.raw_coin_market', 'U') IS NULL
BEGIN
    CREATE TABLE bronze.raw_coin_market (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ingested_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        source_api NVARCHAR(100) NOT NULL DEFAULT 'coingecko',
        raw_json NVARCHAR(MAX) NOT NULL,
        coin_count INT NULL
    );
END;
GO
