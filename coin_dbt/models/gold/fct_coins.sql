{{ config(materialized='table', schema='gold') }}

select
    coin_id as id,
    name,
    symbol,
    current_price as price,
    price_change_percentage_24h as change24h,
    market_cap as marketCap,
    total_volume as volume24h,
    image_url as image,
    circulating_supply as circulatingSupply,
    ath as allTimeHigh,
    atl as allTimeLow
from {{ ref('stg_coins') }}
