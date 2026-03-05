{{ config(materialized='incremental', schema='silver', unique_key=['coin_id', 'timestamp_utc']) }}

with raw_price_history as (
    select
        coin_id,
        timestamp_utc,
        price,
        market_cap,
        total_volume,
        ingested_at
    from {{ source('bronze', 'raw_price_history') }}
    {% if is_incremental() %}
    where ingested_at > (select max(ingested_at) from {{ this }})
    {% endif %}
),
deduped as (
    select
        *,
        row_number() over (
            partition by coin_id, timestamp_utc
            order by ingested_at desc
        ) as rn
    from raw_price_history
)

select
    cast(coin_id as nvarchar(100)) as coin_id,
    cast(timestamp_utc as datetime2) as timestamp_utc,
    cast(price as decimal(24, 8)) as price,
    cast(market_cap as decimal(24, 2)) as market_cap,
    cast(total_volume as decimal(24, 2)) as total_volume,
    ingested_at
from deduped
where rn = 1
