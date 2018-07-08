CREATE OR REPLACE FUNCTION create_rcv_tables()
  RETURNS integer AS $$
DECLARE x TEXT;
DECLARE table_name text;
BEGIN
  RAISE NOTICE 'Creating RCV Result tables';

  FOR x IN SELECT description as x FROM contest LOOP
    table_name = trim(x);
    RAISE NOTICE 'Creating contest table for  %s...', table_name;

    EXECUTE 'create table' || quote_ident(table_name) || 'as
      with current_contest_id as (
          select id::int
          from contest
          where description =''' || x || '''
      ),
          firsts as (
            select
              voter_id,
              over_vote,
              under_vote,
              c.description  as candidate,
              tt.description as tally_type,
              p.description  as precinct
            from
              vote
              LEFT JOIN candidate c ON vote.candidate_id :: int = c.id :: int
              LEFT JOIN tally_type tt ON vote.tally_type_id :: int = tt.id :: int
              LEFT JOIN precinct p on vote.precinct_id :: int = p.id :: int
            where vote_rank :: int = 1 and vote.contest_id :: int = (select id from current_contest_id)
        ),
          seconds as (
            select
              voter_id,
              over_vote,
              under_vote,
              c.description  as candidate,
              tt.description as tally_type,
              p.description  as precinct
            from
              vote
              LEFT JOIN candidate c ON vote.candidate_id :: int = c.id :: int
              LEFT JOIN tally_type tt ON vote.tally_type_id :: int = tt.id :: int
              LEFT JOIN precinct p on vote.precinct_id :: int = p.id :: int
            where vote_rank :: int = 2 and vote.contest_id :: int = (select id from current_contest_id)
        ),
          thirds as (
            select
              voter_id,
              over_vote,
              under_vote,
              c.description  as candidate,
              tt.description as tally_type,
              p.description  as precinct
            from
              vote
              LEFT JOIN candidate c ON vote.candidate_id :: int = c.id :: int
              LEFT JOIN tally_type tt ON vote.tally_type_id :: int = tt.id :: int
              LEFT JOIN precinct p on vote.precinct_id :: int = p.id :: int
            where vote_rank :: int = 3 and vote.contest_id :: int = (select id from current_contest_id)
        )
      select
        firsts.voter_id           :: INT             as voter_id,
        trim(firsts.precinct)                        as precinct,
        trim(firsts.tally_type)                      as tally_type,
        trim (firsts.candidate)                      as first_choice,
        firsts.over_vote          :: INT :: BOOLEAN  as first_over_vote,
        firsts.under_vote         :: INT :: BOOLEAN  as first_under_vote,
        trim(seconds.candidate)                      as second_choice,
        seconds.over_vote         :: INT :: BOOLEAN  as second_over_vote,
        seconds.under_vote        :: INT :: BOOLEAN  as second_under_vote,
        trim(thirds.candidate)                       as third_choice,
        thirds.over_vote          :: INT :: BOOLEAN  as thirds_over_vote,
        thirds.under_vote         :: INT :: BOOLEAN  as thirds_under_vote
      from
        firsts
        JOIN seconds using (voter_id)
        JOIN thirds USING (voter_id);';


  END LOOP;

  RAISE NOTICE 'Done creating contest tables';
  RETURN 1;
END;
$$
LANGUAGE plpgsql;

select create_rcv_tables()
