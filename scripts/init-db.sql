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

IF NOT EXISTS (
    SELECT 1
    FROM sys.schemas
    WHERE name = 'silver'
)
BEGIN
    EXEC('CREATE SCHEMA silver');
END;
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.schemas
    WHERE name = 'gold'
)
BEGIN
    EXEC('CREATE SCHEMA gold');
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

IF OBJECT_ID('bronze.raw_price_history', 'U') IS NULL
BEGIN
    CREATE TABLE bronze.raw_price_history (
        id INT IDENTITY(1,1) PRIMARY KEY,
        coin_id NVARCHAR(100) NOT NULL,
        timestamp_utc DATETIME2 NOT NULL,
        price DECIMAL(24,8) NOT NULL,
        market_cap DECIMAL(24,2) NULL,
        total_volume DECIMAL(24,2) NULL,
        ingested_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_raw_price_history_coin_timestamp UNIQUE (coin_id, timestamp_utc)
    );

    CREATE NONCLUSTERED INDEX IX_raw_price_history_coin_id
        ON bronze.raw_price_history (coin_id);
END;
GO

IF OBJECT_ID('dbo.watchlist', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.watchlist (
        id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        coin_id NVARCHAR(100) NOT NULL,
        added_at DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT UQ_watchlist_coin_id UNIQUE (coin_id)
    );
END;
GO
