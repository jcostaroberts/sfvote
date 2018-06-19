#!/usr/bin/env python

import util

# Get dataset of all unique 1/2/3 combos and the number of occurrences for each.
# Then for each line in that dataset, for each rank (1, 2, 3) output
# [id, candidate, rank, count].
sql_script = """
create temp table unq as
    select
        replace(first_choice || second_choice || third_choice, " ", "") as id,
        first_choice as first,
        second_choice as second,
        third_choice as third,
        count (*) as count
    from mayor_rcv
    group by first, second, third;

select id, first, 1 as rank, count from unq
union all
select id, second, 2 as rank, count from unq
union all
select id, third, 3 as rank, count from unq
order by id, rank;
"""

# Replace concatenated candidate-name ID with number; replace candidate full name with last only;
# change "" to "NONE".
def process_row(id_mapping, row):
    return (id_mapping[row[0]], (row[1] or "NONE").split()[-1], row[2], row[3])

def process(data):
    id_mapping = {k: v for v, k in enumerate(set([x[0] for x in data]))}
    data = map(lambda x: process_row(id_mapping, x), data)
    return data

if __name__ == "__main__":
     util.process_db_to_csv(util.data_filename("mayor_rcv.sql"),
                            sql_script,
                            process,
                            ["combo_id", "candidate", "rank", "count"],
                            util.data_filename("mayor_rcv_v1_ggalluvial.csv"))
