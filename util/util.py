#!/usr/bin/env python

import csv
import json
import sqlite3

def db_run_script(cursor, script):
    queries = [x + ";" for x in script.split(";")[:-1]]
    map(lambda q: cursor.execute(q), queries)

def db_get_list(cursor):
    return cursor.fetchall()

def csv_to_list(filename):
    data = []
    with open(filename, "r") as f:
        r = csv.reader(f, delimiter=",")
        for row in r:
            data.append(row)
    return data

def csv_from_list(data, header, filename):
    with open(filename, "w") as f:
        w = csv.writer(f, delimiter=",")
        w.writerow(header)
        w.writerows(data)

def json_from_lists(datalist, datasetnames, headerlist, filename):
    with open(filename, "w") as f:
        json.dump({dsname: [dict(zip(header, x)) for x in data] for (dsname, header, data) in \
                  zip(datasetnames, headerlist, datalist)},
                  f, sort_keys=True, indent=2)

# General-purpose processing function: apply a SQL script to some db, convert to
# a python list, apply some python processing logic, and then write to a csv.
def process_db_to_csv(dbfilename, sql_script, process_fn, csvheader, csvfilename):
    conn = sqlite3.connect(dbfilename)
    cur = conn.cursor()
    db_run_script(cur, sql_script)
    csv_from_list(process_fn(db_get_list(cur)), csvheader, csvfilename)
    conn.close()

# Give a provided data file name a full path.
def data_filename(filename):
    return "../data/" + filename
