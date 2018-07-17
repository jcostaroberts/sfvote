-- Number of tiems candidates appeared together on a ballot.
-- Ignores order, so Kim, Leno, Breed and Breed, Leno, Kim count the same

with base as (select
                array(select DISTINCT x
                      from UNNEST(Array [first_choice, second_choice, third_choice]) x
                      where x is not null
                      ORDER BY 1) as candidates,
                count(1)          as ballots

              from votes_20180605_20180627."Mayor"

              group by 1
              order by 2 desc)
select
  candidates,
  ballots,
  round(ballots * 100.0 / (select sum(ballots)
                           from base), 3) as percentage
from base;
