var arc = d3.arc();
const pool_sizes = make_angular([20,60,5,1,34,36,1,0.5,5,0.3,40,33,12,4,2,3.4,43])

var chart = d3.select("body").append("svg:svg")
  .attr("class", "chart")
  .attr("width", 420)
  .attr("height", 420).append("svg:g")
  .attr("transform", "translate(200,200)");

chart.selectAll("path")
  .data(pool_sizes)
  .enter().append("svg:path")
  .attr("fill", (d) => {return `rgba(${d.start * 30}, ${d.end * 30}, ${d.end * 30}, 0.5)`})
  .attr("d", function(d, i){
    return arc({innerRadius: 119,
      outerRadius: 125,
      startAngle: d.start,
      endAngle: d.end,
      padAngle: 0.006,
      padRadius: 50,
      cornerRadius: 4})
  });


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