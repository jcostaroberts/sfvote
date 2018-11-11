var width = 700;
var height = 600;
var radius = 300;

var svg = d3
  .select("#chart")
  .append("svg:svg")
  .attr("width", width)
  .attr("height", height)
  .append("svg:g")
  .attr("id", "container")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(d3.schemeSet3);

// use gray for no selection
function candidateColor(name) {
  if (name) return color(name);
  return "#999";
}

var partition = d3.partition().size([2 * Math.PI, radius * radius]);

var arc = d3
  .arc()
  .startAngle(function(d) {
    return d.x0;
  })
  .endAngle(function(d) {
    return d.x1;
  })
  .innerRadius(function(d) {
    return Math.sqrt(d.y0);
  })
  .outerRadius(function(d) {
    return Math.sqrt(d.y1);
  });

d3.json("data.json", function(json) {
  drawChart(json);
});

function drawChart(json) {
  var root = d3
    .hierarchy(json)
    .sum(function(d) {
      return d.votes || 0;
    })
    .sort(function(a, b) {
      return b.value - a.value;
    });

  drawSvgLegend(root);
  var nodes = partition(root).descendants();

  var p = svg
    .data([json])
    .selectAll("path")
    .data(nodes)
    .enter()
    .append("svg:path")
    .attr("display", function(d) {
      return d.depth ? null : "none";
    })
    .attr("d", arc)
    .style("fill", function(d) {
      return candidateColor(d.data.name);
    })
    .style("opacity", 1)
    .on("mouseover", mouseover);

  d3.select("#container").on("mouseleave", mouseleave);
}

function mouseover(d) {
  var ancestors = d.ancestors();
  var totalVotes = ancestors.pop().value; // remove the "Total Votes" node, also get the total vote count
  var selections = ancestors.map(d => formatName(d.data.name)).reverse();

  var percentageString = ((100 * d.value) / totalVotes).toPrecision(3) + "%";

  d3.selectAll("path").style("opacity", 0.2);
  d3.selectAll("path")
    .filter(function(n) {
      return ancestors.indexOf(n) > -1;
    })
    .style("opacity", 1);

  var hasFirstChoice = selections.length > 0;
  var hasSecondChoice = selections.length > 1;
  var hasThirdChoice = selections.length > 2;
  d3.select("#first-choice")
    .text(hasFirstChoice ? selections[0] : "Any Candidate")
    .classed("muted", !hasFirstChoice);
  d3.select("#second-choice")
    .text(hasSecondChoice ? selections[1] : "Any Candidate")
    .classed("muted", !hasSecondChoice);
  d3.select("#third-choice")
    .text(hasThirdChoice ? selections[2] : "Any Candidate")
    .classed("muted", !hasThirdChoice);

  d3.select("#vote-total").text(d.value.toLocaleString());
  d3.select("#percentage").text(percentageString);

  d3.select("#results-explanation").style("visibility", "");
  d3.select("#chart-explanation").style("visibility", "hidden");
}

function mouseleave(d) {
  d3.select("#results-explanation").style("visibility", "hidden");
  d3.select("#chart-explanation").style("visibility", "");
  d3.selectAll("path").style("opacity", 1);
}

function drawSvgLegend(root) {
  var candidates = root.children.map(child => child.data.name);
  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 150,
    h: 25,
    s: 3,
    r: 3
  };

  var legend = d3
    .select("#sidebar")
    .append("svg:svg")
    .attr("width", li.w)
    .attr("height", candidates.length * (li.h + li.s));

  var g = legend
    .selectAll("g")
    .data(candidates)
    .enter()
    .append("svg:g")
    .attr("transform", function(d, i) {
      return "translate(0," + i * (li.h + li.s) + ")";
    });

  g.append("svg:rect")
    .attr("rx", li.r)
    .attr("ry", li.r)
    .attr("width", li.w)
    .attr("height", li.h)
    .style("fill", function(d) {
      return candidateColor(d);
    });

  g.append("svg:text")
    .attr("x", li.w / 2)
    .attr("y", li.h / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return formatName(d);
    });
}

function formatName(name) {
  return !!name ? name.toLowerCase() : "no vote";
}

// based on
// https://bl.ocks.org/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8
//
