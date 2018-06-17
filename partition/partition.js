var width = 1500,
  height = 500;

var color = d3.scale.category20();

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var partition = d3.layout
  .partition()
  .size([width, height])
  .value(function(d) {
    return d.size;
  });

d3.json("candidates.json", function(error, root) {
  if (error) throw error;

  var nodes = partition.nodes(root);

  svg
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("rect")
    .attr("class", "node")
    .attr("x", function(d) {
      return d.x;
    })
    .attr("y", function(d) {
      return d.y;
    })
    .attr("width", function(d) {
      return d.dx;
    })
    .attr("height", function(d) {
      return d.dy;
    })
    .style("fill", function(d) {
      return color(d.name);
    });

  svg
    .selectAll(".label")
    .data(
      nodes.filter(function(d) {
        return d.dx > 6;
      })
    )
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("dy", ".35em")
    .attr("transform", function(d) {
      return (
        "translate(" + (d.x + d.dx / 2) + "," + (d.y + d.dy / 2) + ")rotate(90)"
      );
    })
    .text(function(d) {
      const votes = total(d);
      return `${d.name} - ${votes}`;
    });
});

function total(d) {
  if (d.size) return d.size;
  return d.children.reduce((acc, child) => {
    return acc + total(child);
  }, 0);
}
