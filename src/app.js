const arc = d3.arc();
const pool_sizes = make_angular([20,60,5,1,34,36,1,0.5,5,0.3,40,33,12,4,2,3.4,43])

const svg = d3.select(".container").append("svg");

let width = document.getElementsByClassName("container")[0].offsetWidth
let height = document.getElementsByClassName("container")[0].offsetHeight   

svg.attr("width", '100%')
  .attr("height",  '100%')
  // .attr("transform", "translate(200,200)")
  .style("background", "#ccc")

svg.selectAll("path")
  .data(pool_sizes)
  .enter()
  .append("path")
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