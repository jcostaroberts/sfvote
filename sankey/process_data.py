#!/usr/bin/env python

import re
import util

# Split the table, which has three columns per round, into one table per round.
def split_data_into_rounds(data):
    nround = len([x for x in data[0] if re.search("Round", x)])
    rounds = []
    for r in range(nround):
        vcol = 1+r*3
        tcol = 3+r*3
        round = []
        for can in data[2:]:
            if can[0] in ["Under Votes", "Continuing Ballots", "TOTAL",
                          "Exhausted by Over Votes", "Exhausted Ballots"]:
                continue
            round.append([can[0], int(can[vcol]), int(can[tcol])])
        # Treat the exhausted categories as a single candidate.
        round.append(["EXHAUSTED",
                     sum([int(x[vcol]) for x in data[2:] if re.search("Exhausted", x[0])]),
                     sum([int(x[tcol]) for x in data[2:] if re.search("Exhausted", x[0])])])
        rounds.append(round)
    return rounds

def name_row(candidate_row):
    return candidate_row[0]

def votes_row(candidate_row):
    return int(candidate_row[1])

def transfer_row(candidate_row):
    return int(candidate_row[2])

def id_node(candidate_node):
    return candidate_node[0]

def name_node(candidate_node):
    return candidate_node[1]

node_id = 0
def add_node(nodes, label, weight):
    global node_id
    node = [node_id, label, weight]
    nodes.append(node)
    node_id += 1
    return node

def add_edge(edges, sourcenode, targetnode, weight):
    edges.append([id_node(sourcenode), id_node(targetnode), weight])

def compute_graph(data):
    rounds = split_data_into_rounds(data)

    nodes = []
    edges = []

    # List of candidates still in the running
    remaining_candidates = list(set([name_row(x) for x in rounds[0]]))
    last_eliminated = None # Last node of the most recently eliminated candidate
    last_round_transfer = {} # Candidate-wise list of last round's transfers

    for round in rounds:
        next_round_transfer = {}
        for candidate in round:
            # Skip irrelevant candidates
            if name_row(candidate) not in remaining_candidates:
                continue
            # Add candidate node for this round
            cn = add_node(nodes, name_row(candidate), votes_row(candidate))

            # If the candidate got transfers this round, record them for next round
            if transfer_row(candidate):
                next_round_transfer[name_row(candidate)] = transfer_row(candidate)

            # If this candidate got transfers from the most recently eliminated candidate,
            # add an edge from the eliminated candidate to this one.
            if last_eliminated:
                tf = last_round_transfer.get(name_row(candidate))
                if tf:
                    add_edge(edges, last_eliminated, cn, tf)

            # If candidate got no votes or is listed with negative transfers, eliminate.
            if votes_row(candidate) == 0 or transfer_row(candidate) < 0:
                next_eliminated = cn

        # Update most recently eliminated node
        last_eliminated = next_eliminated
        # Update transfer holder
        last_round_transfer = next_round_transfer
        # Remove eliminated candidate
        remaining_candidates = filter(lambda x: x != name_node(last_eliminated), remaining_candidates)

    return nodes, edges

if __name__ == "__main__":
    data = util.csv_to_list("../data/20180605_rcv_mayor.csv")
    nodes, edges = compute_graph(data)
    util.csv_from_list(nodes, ["id", "name", "weight"], "../data/rcv_nodes.csv")
    util.csv_from_list(edges, ["source", "target", "weight"], "../data/rcv_edges.csv")
