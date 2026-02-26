{{ config(materialized='view', schema='silver') }}

with raw_coin_market as (
    select
        ingested_at,
        raw_json
    from {{ source('bronze', 'raw_coin_market') }}
),
exploded as (
    select
        r.ingested_at,
        c.value as coin_json
    from raw_coin_market as r
    cross apply openjson(r.raw_json) as c
),
parsed as (
    select
        cast(json_value(e.coin_json, '$.id') as nvarchar(100)) as coin_id,
        cast(json_value(e.coin_json, '$.name') as nvarchar(200)) as name,
        cast(json_value(e.coin_json, '$.symbol') as nvarchar(50)) as symbol,
        cast(json_value(e.coin_json, '$.current_price') as decimal(18,8)) as current_price,
        cast(json_value(e.coin_json, '$.market_cap') as bigint) as market_cap,
        cast(json_value(e.coin_json, '$.total_volume') as bigint) as total_volume,
        cast(json_value(e.coin_json, '$.price_change_percentage_24h') as decimal(18,8)) as price_change_percentage_24h,
        cast(json_value(e.coin_json, '$.image') as nvarchar(500)) as image_url,
        cast(json_value(e.coin_json, '$.circulating_supply') as decimal(38,8)) as circulating_supply,
        cast(json_value(e.coin_json, '$.ath') as decimal(38,8)) as ath,
        cast(json_value(e.coin_json, '$.atl') as decimal(38,8)) as atl,
        e.ingested_at,
        row_number() over (
            partition by cast(json_value(e.coin_json, '$.id') as nvarchar(100))
            order by e.ingested_at desc
        ) as rn
    from exploded as e
)

select
    coin_id,
    name,
    symbol,
    current_price,
    market_cap,
    total_volume,
    price_change_percentage_24h,
    image_url,
    circulating_supply,
    ath,
    atl,
    ingested_at
from parsed
where rn = 1
