#!/usr/bin/env python

import csv

"""
This script assumes the existence of two other files:
    - precincts_to_districts.txt: precinct -> BOS district mappings
      (http://sfgov.org/elections/sites/default/files/Documents/ElectionsArchives/2016/Nov/ConsolDistBT_20160818_NoDups.txt)
    - measure_a_turnout_2014.txt, which is the portion of the Statement of the Vote on SF Measure A (arbitrary--just has to
      be something the whole city voted on).
      (http://www.sfelections.org/results/20141104/#english_detail)
Could be generalized to all elections assuming continuity in SOV formatting...but why?
"""

def get_precinct_to_bosdist():
    precinct_to_supdist_file = "precincts_to_districts.txt"
    p_to_d = {}

    # precinct file format:
    # VotingPrecinctID    VotingPrecinctName  MailBallotPrecinct  BalType Assembly
    # BART    Congressional   Senatorial  Supervisorial
    precinct_pos = 0
    bosdist_pos = -1

    f = open(precinct_to_supdist_file, "r")
    reader = csv.reader(f, delimiter='\t')
    for row in reader:
        if not row[precinct_pos].isdigit():
            continue
        precinct_id = int(row[precinct_pos])
        supdist = int(row[bosdist_pos])
        p_to_d[precinct_id] = supdist
    f.close()
    return p_to_d

def get_consolidated_turnout(bos_districts):
    turnout_file = "measure_a_turnout_2014.txt"
    turnout_by_precinct = {}
    print bos_districts

    # turnout file format:
    # PrecinctName    ReportingType   PrecinctID  Precincts   Registration    Ballots Cast
    # Turnout (%) Yes No  Under Vote  Over Vote
    precinct_pos = 2
    reg_pos = 4
    votes_pos = 5

    f = open(turnout_file, "r")
    reader = csv.reader(f, delimiter='\t')
    for row in reader:
        print row[precinct_pos]
        if not row[precinct_pos].isdigit():
            continue
        precinct = int(row[precinct_pos])
        registered = int(row[reg_pos])
        votes = int(row[votes_pos])
        v = turnout_by_precinct[precinct][3] if precinct in turnout_by_precinct else 0
        turnout_by_precinct[precinct] = [precinct, bos_districts[precinct], registered, v + votes]
    f.close()
    return turnout_by_precinct.values()

def get_turnout_by_district(turnout_by_precinct):
    turnout = {}
    for row in turnout_by_precinct:
        precinct = row[0]
        district = row[1]
        registered = row[2]
        voted = row[3]
        if district not in turnout:
            turnout[district] = [district, registered, voted]
        else:
            turnout[district] = [district, turnout[district][1] + registered,
                                 turnout[district][2] + voted]
    return turnout.values()

def write_turnout_files(turnout_by_precinct):
    # Turnout by precinct
    f = open("2014-11_turnout_by_precinct.csv", "wt")
    writer = csv.writer(f)
    writer.writerow(["Precinct", "BOS_District", "Registered", "Voted"])
    map(writer.writerow, sorted(turnout_by_precinct, key=lambda x: x[0]))
    f.close()

    # Turnout by district
    f = open("2014-11_turnout_by_district.csv", "wt")
    writer = csv.writer(f)
    writer.writerow(["BOS_District", "Registered", "Voted"])
    district_turnout = get_turnout_by_district(turnout_by_precinct)
    map(writer.writerow, sorted(district_turnout, key=lambda x: x[0]))
    f.close()

if __name__ == "__main__":
    write_turnout_files(get_consolidated_turnout(get_precinct_to_bosdist()))
