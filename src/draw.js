function draw(sizes) { 
  const arc = d3.arc();
  const ribbon = d3.ribbon();
  let pool_sizes = make_angular(sizes.slice(0,300).map((pool) => pool.size));

  let svg = d3.select(".container").append("svg");

  let width = document.getElementsByClassName("container")[0].offsetWidth;
  let height = document.getElementsByClassName("container")[0].offsetHeight ;
  let minimum_dimension = Math.min(width, height);

  //https://github.com/d3/d3-scale-chromatic
  //https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
  var color = d3.scaleOrdinal().domain(pool_sizes)
    .range(d3.schemePastel1);

  svg.attr("width", '100%')
    .attr("height",  '100%')
    .style("background", "#fff");

  let g = svg.append('g')
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  g.selectAll("path #chord")
    .data(pool_sizes)
    .enter()
    .append("path")
    .attr("fill", function(d, i) { return color(i); })
    .style("opacity", 1)
    .attr("d", function(d, i){
      return arc({
        outerRadius: (minimum_dimension/2)-50,
        innerRadius: (minimum_dimension/2)-60,
        startAngle: d.start,
        endAngle: d.end,
        padAngle: 0.006,
        padRadius: 1,
        cornerRadius: 4})})
    .style('stroke', function(d, i) { return color(i); });

  g.selectAll("path #ribbon")
    .data(pool_sizes)
    .enter()
    .append("path")
    .attr("fill", function(d, i) { return color(i); })
    .style("opacity", 1)
    .attr("d", function(d, i) {
      let r = Math.random()
      return ribbon({
        source: {startAngle: d.start, endAngle: d.start+0.001, radius: (minimum_dimension/2)-66},
        target: {startAngle: pool_sizes[parseInt(r * pool_sizes.length)].start, endAngle: pool_sizes[parseInt(r * pool_sizes.length)].start+0.001, radius: (minimum_dimension/2)-66}})
      })
    .style('stroke', function(d, i) { return color(i); });


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