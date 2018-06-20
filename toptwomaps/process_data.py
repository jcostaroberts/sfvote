#!/usr/bin/env python

import util

# For each candidate, get the number of first-ranked votes per precinct.
sql_script = """
select
    trim(replace(precinct, "Pct ", "")) as precinct,
    trim(first_choice) as first,
    first_over_vote as first_over,
    trim(second_choice) as second,
    second_over_vote as second_over,
    trim(third_choice) as third,
    third_over_vote as third_over
from mayor_rcv;
"""

def ballot_precinct(ballot):
    return ballot[0]

def ballot_rank(ballot, rank):
    return ballot[1 + 2*(rank-1)]

def ballot_exhausted_at_rank(ballot, rank):
    return ballot[2 + 2*(rank-1)] == "1"

EXHAUSTED = "EXHAUSTED"

# Determine a ballot's effective vote. If the ballot is already EXHAUSTED, it must
# remain so. Otherwise, take the highest vote that's not marked an over-vote.
def effective_vote(ballot, ev, candidate_votes):
    if ev == EXHAUSTED:
        return EXHAUSTED
    for rank in [1, 2, 3]:
        if ballot_exhausted_at_rank(ballot, rank):
            return EXHAUSTED
        if ballot_rank(ballot, rank) in candidate_votes:
            return ballot_rank(ballot, rank)
    return EXHAUSTED

# Does any of the remaining candidates have > 50% of continuing ballots?
def winner_exists(candidate_votes):
    total_continuing_ballots = sum(candidate_votes.values())
    if sorted(candidate_votes.items(),
              key=lambda (k, v): v, reverse=True)[0][1] > total_continuing_ballots/2.0:
        return True

# Run the RCV algorithm on all the ballots; output a list of [precinct, candidate],
# where candidate is the highest-ranked candidate on a ballot during the round the
# winner was elected.
def process(data):
    # Output dataset
    out = [[ballot_precinct(ballot), None] for ballot in data]

    # Remaining-candidate vote table
    candidate_votes = {k: 0 for k in set([ballot_rank(ballot, 1) for ballot in data] +
                                         [ballot_rank(ballot, 2) for ballot in data] +
                                         [ballot_rank(ballot, 3) for ballot in data])}
    candidate_votes.pop("")

    while True:
        # For each ballot, get its effective vote given the current set of remaining candidates
        for i in range(len(data)):
            ev = effective_vote(data[i], out[i][1], candidate_votes)
            out[i][1] = ev
            if ev != EXHAUSTED:
                candidate_votes[ev] += 1

        # Keep iterating until the win criterion is met
        if winner_exists(candidate_votes):
            break

        # Remove the lowest-ranking candidate and reset and (now smaller) candidate vote table
        eliminated = sorted(candidate_votes.items(), key=lambda (k, v): v)[0][0]
        candidate_votes.pop(eliminated)
        candidate_votes = {k: 0 for k in candidate_votes}

    return out

if __name__ == "__main__":
     util.process_db_to_csv(util.data_filename("mayor_rcv.sql"),
                            sql_script,
                            #lambda x: x,
                            #["precinct", "first", "first_over", "second", "second_over", "third", "third_over"],
                            process,
                            ["precinct", "candidate"],
                            util.data_filename("mayor_rcv_final_vote.csv"))
