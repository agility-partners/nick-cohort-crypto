{{ config(materialized='incremental', schema='gold', unique_key=['coin_id', 'timestamp_utc']) }}

select
    ph.coin_id,
    ph.timestamp_utc,
    ph.price,
    ph.market_cap,
    ph.total_volume
from {{ ref('stg_price_history') }} as ph
inner join {{ ref('fct_coins') }} as fc
    on ph.coin_id = fc.id
{% if is_incremental() %}
where not exists (
    select 1 from {{ this }}
    where coin_id = ph.coin_id and timestamp_utc = ph.timestamp_utc
)
{% endif %}
