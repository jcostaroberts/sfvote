
create table tally_type (
  id text not null primary key,
  description text not null
);

create table contest (
  id          text not null primary key,
  description text not null
);

create table candidate (
  id          text    not null primary key,
  description text    not null,
  contest_id  text    not null references contest (id) on delete cascade,
  is_write_in boolean not null
);

create table precinct (
  id          text not null primary key,
  description text not null
);

create table vote (
  contest_id    TEXT NOT NULL references contest (id) on delete cascade,
  voter_id      TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  tally_type_id TEXT NOT NULL,
  precinct_id   TEXT NOT NULL references precinct (id) on delete cascade,
  vote_rank     TEXT NOT NULL,
  candidate_id  TEXT NOT NULL, -- no votes reference no candidate id
  over_vote     TEXT NOT NULL,
  under_vote    TEXT NOT NULL
);

insert into contest (id, description)
  select
    substring(input from 11 for 7),
    substring(input from 18 for 50)
  from master_lookup
  where input like 'Contest%';

insert into precinct (id, description)
  select
    substring(input from 11 for 7),
    substring(input from 18 for 50)
  from master_lookup
  where input like 'Precinct%';

insert into candidate (id, description, contest_id, is_write_in)
  select
    substring(input from 11 for 7),
    substring(input from 18 for 50),
    substring(input from 75 for 7),
    substring(input from 82 for 1) :: BOOLEAN
  from master_lookup
  where input like 'Candidate%';

insert into tally_type (id, description)
  select
    substring(input from 11 for 7),
    substring(input from 18 for 50)
  from master_lookup
  where input like 'Tally Type%';


insert into vote (contest_id, voter_id, serial_number, tally_type_id, precinct_id, vote_rank, candidate_id, over_vote, under_vote)
  select
    substring(input from 1 for 7),
    substring(input from 8 for 9),
    substring(input from 17 for 7),
    substring(input from 24 for 3),
    substring(input from 27 for 7),
    substring(input from 34 for 3),
    substring(input from 37 for 7),
    substring(input from 44 for 1),
    substring(input from 45 for 1)
  from ballot_image;
