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
  .attr("fill", `rgba(0, 130, 0, 0.5)`)
  .attr("d", function(d, i){
    return arc({innerRadius: 70,
      outerRadius: 85+i,
      startAngle: pool_sizes[i - 1],
      endAngle: d})
  });


function make_angular(values) {
  const sum = values.reduce((a, b) => a + b, 0);
  const t = Math.PI * 2;
  const angular = values.map((pool_size) => {
    return (pool_size / sum) * t
  });
  return angular
}