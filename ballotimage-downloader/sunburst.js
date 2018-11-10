/**
 * Produce data for a sunburst chart
 *
 * @param data Array of ballots for an election. Ballots must contain
 * {
 *   first: string,
 *   second: string,
 *   third: string
 * }
 *
 */
function sunburst(data) {
  const first = reducer(data, "first");
  for (const i in first) {
    first[i] = reducer(first[i], "second");
    for (const j in first[i]) {
      first[i][j] = reducer(first[i][j], "third");
      for (const k in first[i][j]) {
        first[i][j][k] = first[i][j][k].length;
      }
    }
  }

  const obj = {
    name: "Total Votes",
    children: splitter(first)
  };

  return obj;
}

function reducer(data, field) {
  return data.reduce(function(rv, d) {
    (rv[d[field]] = rv[d[field]] || []).push(d);
    return rv;
  }, {});
}

function splitter(selectionTree) {
  return Object.keys(selectionTree).map(k => {
    if (isNumber(selectionTree[k])) {
      return {
        name: k,
        votes: selectionTree[k]
      };
    } else {
      return {
        name: k,
        children: splitter(selectionTree[k])
      };
    }
  });
}

function isNumber(x) {
  return typeof x === "number";
}

module.exports = sunburst;
