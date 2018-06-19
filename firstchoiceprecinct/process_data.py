#!/usr/bin/env python

import util

# For each candidate, get the number of first-ranked votes per precinct.
sql_script = """
create temp table precinct_first as
    select precinct,
           first_choice,
           count(voter_id) as count
    from mayor_rcv
    group by precinct,
    first_choice;
select * from precinct_first;
"""

# Remove whitespace and replace candidate "" with "NONE".
def process(data):
    data = map(lambda x: [x[0].strip().split()[1], x[1].strip() or "NONE", x[2]], data)
    return data

if __name__ == "__main__":
     util.process_db_to_csv(util.data_filename("mayor_rcv.sql"),
                            sql_script,
                            process,
                            ["precinct", "candidate", "count"],
                            util.data_filename("mayor_rcv_v1_precinct_firsts.csv"))
