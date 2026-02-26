{{ config(materialized='table', schema='gold') }}

select
    coin_id as id,
    name,
    symbol,
    current_price as price,
    price_change_percentage_24h as change_24h,
    market_cap,
    total_volume as volume_24h,
    image_url as image,
    circulating_supply,
    ath as all_time_high,
    atl as all_time_low,
    case
        when price_change_percentage_24h > 10 then 'strong_up'
        when price_change_percentage_24h > 2 then 'up'
        when price_change_percentage_24h >= -2 and price_change_percentage_24h <= 2 then 'stable'
        when price_change_percentage_24h < -10 then 'strong_down'
        when price_change_percentage_24h < -2  then 'down'
        else 'stable'
    end as price_trend,
    (
        cast(market_cap as decimal(38, 8))
        / nullif(sum(cast(market_cap as decimal(38, 8))) over (), 0)
    ) * 100 as market_dominance_pct
from {{ ref('stg_coins') }}
