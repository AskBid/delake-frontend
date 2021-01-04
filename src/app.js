var arc = d3.arc();

var chart = d3.select("body").append("svg:svg")
    .attr("class", "chart")
    .attr("width", 420)
    .attr("height", 420).append("svg:g")
    .attr("transform", "translate(200,200)");

chart.selectAll("path")
    .data([250,50,60])
    .enter().append("svg:path")
    .attr("fill", `rgba(0, 130, 0, 0.5)`)
    .attr("d", function(d){
        return arc({innerRadius: 50,
          outerRadius: d,
          startAngle: 0,
          endAngle: Math.PI + (Math.PI / 2)})
    });