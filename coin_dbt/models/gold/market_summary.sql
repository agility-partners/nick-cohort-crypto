{{ config(materialized='view', schema='gold') }}

select
    count(*) as total_coins,
    sum(market_cap) as total_market_cap,
    sum(volume_24h) as total_24h_volume,
    avg(change_24h) as avg_24h_change_pct,
    sum(case when change_24h > 0 then 1 else 0 end) as coins_up,
    sum(case when change_24h < 0 then 1 else 0 end) as coins_down,
    max(case when id = 'bitcoin' then market_dominance_pct end) as btc_dominance_pct
from {{ ref('fct_coins') }}
