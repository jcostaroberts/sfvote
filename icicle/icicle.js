//stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

var width = 1200,
  height = 600;

var x = d3.scale.linear().range([0, width]);

var y = d3.scale.linear().range([0, height]);

var color = d3.scale.category20c();

var partition = d3.layout
  .partition()
  .children(function(d) {
    return isNaN(d.value) ? d3.entries(d.value) : null;
  })
  .value(function(d) {
    return d.value;
  });

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var rect = svg.selectAll("rect");
var labels = svg.selectAll(".label");

d3.json(dataPath, function(error, root) {
  if (error) throw error;

  let entries = d3.entries(root)[0];
  let nodes = partition(entries);

  rect = rect
    .data(nodes)
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.x);
    })
    .attr("y", function(d) {
      return y(d.y);
    })
    .attr("width", function(d) {
      return x(d.dx);
    })
    .attr("height", function(d) {
      return y(d.dy);
    })
    .attr("fill", function(d) {
      return color(d.key);
    })
    .on("click", clicked);

  rect.append("svg:title").text(function(d, i) {
    return `${d.value.toLocaleString()} votes`;
  });

  labels = labels
    .data(nodes)
    .enter()
    .append("text")
    .classed("label", true)
    .classed("hidden", function(d) {
      return x(d.dx) < 10;
    })
    .attr("dy", ".35em")
    .attr("transform", function(d) {
      return (
        "translate(" +
        x(d.x + d.dx / 2) +
        "," +
        y(d.y + d.dy / 2) +
        ")rotate(90)"
      );
    })
    .text(function(d) {
      return d.key.toProperCase();
    });
});

function clicked(d) {
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, 1]).range([d.y ? 20 : 0, height]);

  rect
    .transition()
    .duration(750)
    .attr("x", function(d) {
      return x(d.x);
    })
    .attr("y", function(d) {
      return y(d.y);
    })
    .attr("width", function(d) {
      return x(d.x + d.dx) - x(d.x);
    })
    .attr("height", function(d) {
      return y(d.y + d.dy) - y(d.y);
    });

  labels
    .classed("label", true)
    .classed("hidden", function(d) {
      return x(d.x + d.dx) - x(d.x) < 10;
    })
    .transition()
    .duration(750)
    .attr("transform", function(d) {
      return (
        "translate(" +
        x(d.x + d.dx / 2) +
        "," +
        y(d.y + d.dy / 2) +
        ")rotate(90)"
      );
    });
}
