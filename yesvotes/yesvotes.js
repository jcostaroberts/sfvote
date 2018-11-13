const PASSED = "#95bac4";
const FAILED = "#c18b90";
const CHALLENGED = "#aaa";

const LEGEND_WIDTH = 100;

var svg = d3.select("#svg-1"),
  margin = { top: 40, right: 20, bottom: 150, left: 40 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3
  .scaleBand()
  .rangeRound([0, width - LEGEND_WIDTH])
  .paddingInner(0.05)
  .align(0.1);

var y = d3.scaleLinear().rangeRound([height, 0]);

d3.csv("20181111_sf_measures_yes.csv", function(error, data) {
  if (error) throw error;
  buildChart(g, data);
});

function buildChart(el, data) {
  data.sort(function(a, b) {
    return a.date - b.date;
  });
  x.domain(
    data.map(function(d) {
      return measureLabel(d);
    })
  );
  y.domain([
    0,
    d3.max(data, function(d) {
      return +d.pct_yes;
    })
  ]).nice();

  var rect = el
    .append("g")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .on("mouseover", handleMouseOverBar)
    .on("mouseout", handleMouseOutBar)
    .attr("fill", function(d) {
      if (isChallengedProposition(measureLabel(d))) {
        return CHALLENGED;
      }
      return d.passed == "1" ? PASSED : FAILED;
    })
    .attr("x", function(d) {
      return x(measureLabel(d));
    })
    .attr("y", function(d) {
      return y(d.pct_yes);
    })
    .attr("height", function(d) {
      return height - y(d.pct_yes);
    })
    .attr("width", x.bandwidth());
  rect.append("svg:title").text(function(d, i) {
    return measureLabel(d) + ": " + d.short_description;
  });

  el.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    // vertical axis labels
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .attr("transform", "rotate(90)")
    .attr("class", function(d) {
      return `${electionClass(d)} bottom-label`;
    });

  el.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, ".0%"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start");

  el.append("line")
    .attr("x1", 0)
    .attr("y1", y(0.5))
    .attr("x2", width - 10 - LEGEND_WIDTH)
    .attr("y2", y(0.5))
    .attr("stroke", "black")
    .style("stroke-dasharray", "3, 3")
    .attr("stroke-width", 1);

  el.append("line")
    .attr("x1", 0)
    .attr("y1", y(0.666667))
    .attr("x2", width - 10 - LEGEND_WIDTH) // not sure what this 1- is
    .attr("y2", y(0.666667))
    .attr("stroke", "black")
    .style("stroke-dasharray", "3, 3")
    .attr("stroke-width", 1);
}

function measureLabel(d) {
  return ["Prop ", d.measure, ", ", formatDate(d.date)].join("");
}

/**
 * return a class unique to this election
 * .
 * @param  {string} label A measure label
 */
function electionClass(d) {
  return d
    .replace(/[\.|,]/g, "")
    .replace(/ /g, "-")
    .toLowerCase();
}

function handleMouseOverBar(d) {
  selectLabelForData(d).classList.add("highlighted");
}

function handleMouseOutBar(d) {
  selectLabelForData(d).classList.remove("highlighted");
}

function selectLabelForData(d) {
  return document.querySelector(`text.${electionClass(measureLabel(d))}`);
}

function isChallengedProposition(d) {
  return (
    d === "Prop C, Nov. 2018" ||
    d === "Prop C, Jun. 2018" ||
    d === "Prop G, Jun. 2018"
  );
}

function formatDate(d) {
  var yr = d.substring(0, 4);
  var mo = d.substring(4, 6);
  if (mo == "06") {
    mo = "Jun.";
  } else if (mo == "11") {
    mo = "Nov.";
  }
  return [mo, yr].join(" ");
}

// chart title
g.append("text")
  .attr("class", "title")
  .attr("x", width / 2)
  .attr("y", 5)
  .attr("text-anchor", "middle")
  .text("San Francisco Ballot Measures Since 2012 - % Voting Yes");

// legend
var legend = g
  .append("g")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .attr("text-anchor", "end")
  .selectAll("g")
  .data(["Passed", "Failed", "Challenged"])
  .enter()
  .append("g")
  .attr("transform", function(d, i) {
    return "translate(0," + i * 20 + ")";
  });

legend
  .append("rect")
  .attr("x", width)
  .attr("width", 19)
  .attr("height", 19)
  .attr("fill", function(d) {
    switch (d) {
      case "Passed": {
        return PASSED;
      }
      case "Failed": {
        return FAILED;
      }
      case "Challenged": {
        return CHALLENGED;
      }
    }
  });

legend
  .append("text")
  .attr("x", width - 4)
  .attr("y", 9.5)
  .attr("dy", "0.32em")
  .text(function(d) {
    return d;
  });
