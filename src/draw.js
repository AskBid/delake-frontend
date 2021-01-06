function draw(sizes) { const arc = d3.arc();
  let pool_sizes = make_angular(sizes.map((pool) => pool.size))

  let svg = d3.select(".container").append("svg");

  let width = document.getElementsByClassName("container")[0].offsetWidth
  let height = document.getElementsByClassName("container")[0].offsetHeight 
  let minimum_dimension = Math.min(width, height)

  //https://github.com/d3/d3-scale-chromatic
  //https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
  var color = d3.scaleOrdinal().domain(pool_sizes)
    .range(d3.schemePastel1);

  svg.attr("width", '100%')
    .attr("height",  '100%')
    .style("background", "#fff")

  let g = svg.append('g')
    .attr("transform", `translate(${width / 2}, ${height / 2})`)

  g.selectAll("path")
    .data(pool_sizes)
    .enter()
    .append("path")
    .attr("fill", function(d, i) { return color(Math.random() * 1000); })
    .style("opacity", 1)
    .attr("d", function(d, i){
      return arc({
        outerRadius: (minimum_dimension/2)-50,
        innerRadius: (minimum_dimension/2)-60,
        startAngle: d.start,
        endAngle: d.end,
        padAngle: 0.006,
        padRadius: 1,
        cornerRadius: 4})
    }).style('stroke', 'rgba(40,40,40,0.6)');
}

function make_angular(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  const t = Math.PI * 2;
  const angular = values.map((pool_size) => {
    return (pool_size / sum) * t
  });
  let previous = 0
  return angular.map((e) => {
    const arc = {start: previous, end: previous + e}
    previous += e
    return arc
  })
}