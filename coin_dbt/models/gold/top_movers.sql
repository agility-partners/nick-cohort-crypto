{{ config(materialized='view', schema='gold') }}

with gainers as (
    select
        id,
        symbol,
        name,
        price,
        market_cap,
        change_24h,
        'gainer' as category,
        row_number() over (order by change_24h desc) as rank
    from {{ ref('fct_coins') }}
    where change_24h > 0
),
losers as (
    select
        id,
        symbol,
        name,
        price,
        market_cap,
        change_24h,
        'loser' as category,
        row_number() over (order by change_24h asc) as rank
    from {{ ref('fct_coins') }}
    where change_24h < 0
)

select
    id,
    symbol,
    name,
    price,
    marketCap,
    change24h,
    category,
    rank
from gainers
where rank <= 10

union all

select
    id,
    symbol,
    name,
    price,
    marketCap,
    change24h,
    category,
    rank
from losers
where rank <= 10
