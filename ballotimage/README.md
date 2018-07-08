Code for processing SF Dep't of Elections ballot images. Creates a table
in the sfvote database for each RCV contest in an election. Each row represents
one RCV ballot and has the following data:

| Column            | Data Type | Description                       |
| :---------------- | :-------- | :-------------------------------- |
| voter_id          | INT       | ballot id - unique per contest    |
| precinct          | TEXT      | voter precinct                    |
| tally_type        | TEXT      | ballot type \*                    |
| first_choice      | TEXT      | first choice candidate            |
| first_over_vote   | BOOLEAN   | first choice marked as over vote  |
| first_under_vote  | BOOLEAN   | first choice marked as under vote |
| second_choice     | TEXT      |                                   |
| second_over_vote  | BOOLEAN   |                                   |
| second_under_vote | BOOLEAN   |                                   |
| third_choice      | TEXT      |                                   |
| thirds_over_vote  | TEXT      |                                   |
| thirds_under_vote | TEXT      |                                   |

- `Provisional - 400C, VBM / EV - 400c 1st Cut, Election Day - Insight, Election Day - Edge, Dups, Election Day - 400C`

#### instructions

1.  Find two dates - the date of the election and the date of the election report. For example, to process the final results from [this election](https://sfelections.sfgov.org/june-5-2018-election-results-detailed-reports), use `20180605` and `20180627`
2.  Create a PostgreSQL database called `sfvote` (`createdb sfvote`)
3.  Run `load_data.sh 20180605 20180627`

A table for each contest will be created in the `sfvote` database in a schema called `<election date>_<results_date>`. So, votes for the 20180605 mayoral election, will be in the `Mayor` table in the `20180605_20180627` schema.
