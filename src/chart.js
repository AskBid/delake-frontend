let width = document.getElementsByClassName("chart")[0].offsetWidth - 50;
let height = document.getElementsByClassName("chart")[0].offsetHeight - 20;
// set the dimensions and margins of the graph
let margin = {top: 10, right: 40, bottom: 30, left: 40};
width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select(".chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// get the data
$.getJSON(`assets/chart_stake_addresses.json`, function(data) {
	console.log(data)
	let stakes = Object.keys(data).map(key => data[key].stake_addresses_No)
	let delegations = Object.keys(data).map(key => data[key].total_delegation)
	let ratios = Object.keys(data).map(key => data[key].total_delegation / data[key].stake_addresses_No)
	let epochs = Object.keys(data).map(key => parseInt(key))
  // X axis: scale and draw:
  let x = d3.scaleLinear()
      .domain([Math.min(...epochs) - 3, Math.max(...epochs) + 3	])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
  // set the parameters for the histogram
  // var histogram = d3.histogram()
      // .value(function(d) { return d; })   // I need to give the vector of value
      // .domain(x.domain())  // then the domain of the graphic
      // .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  // var bins = d3.histogram(data);
  // Y axis: scale and draw:
  let y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, Math.max(...stakes)+10000]); 

  let y2 = d3.scaleLinear()
      .range([height, 0]);
      y2.domain([Math.min(...delegations) - 10000, Math.max(...delegations)]); // d3.hist has to be called before the Y axis obviously

	let y3 = d3.scaleLinear()
      .range([height-20, 20]);
      y3.domain([0, Math.max(...ratios)]); 

  svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
      .attr('class', 'leftaxis');

  svg.append("g")
  		.attr("transform", `translate(${x(Math.max(...epochs)+3)},0)`)
      .call(d3.axisRight(y2).tickFormat(d3.format(".2s")))
      .attr('class', 'rightaxis');

  let bar_width = ((x(epochs[0] + 1) - x(epochs[0]))/11)*4;

  // append the bar rectangles to the svg element
  svg.selectAll(".stakes_bin")
      .data(epochs)
      .enter()
      .append("rect")
        // .attr("x", 1)
        .attr("transform", function(d) { 
        	return `translate(${x(d)-bar_width}, ${y(data[d].stake_addresses_No)})`; 
        })
        .attr("width", bar_width)
        .attr("height", function(d) { return y(0) - y(data[d].stake_addresses_No); })
        // .attr("height", function(d) { return y(data[d].stake_addresses_No); })
        .style("fill", "rgba(118,183,178,0.6)")
        .style("stroke", "rgba(140,140,140,0.3)")
        .attr('class', 'stakes_bin')

  svg.selectAll(".total_delegation")
      .data(epochs)
      .enter()
      .append("rect")
        // .attr("x", 1)
        .attr("transform", function(d) { 
        	return `translate(${x(d)}, ${y2(data[d].total_delegation)})`; 
        })
        .attr("width", bar_width)
        .attr("height", function(d) { return y(0) - y2(data[d].total_delegation); })
        // .attr("height", function(d) { return y(data[d].stake_addresses_No); })
        .style("fill", "rgba(237,201,73,0.6)")
        .style("stroke", "rgba(140,140,140,0.3)")
        .attr('class', 'total_delegation')

    svg.append("path")
      .datum(epochs)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(function(d) { return x(d) })
        .y(function(d) { return y3(data[d].total_delegation / data[d].stake_addresses_No) })
        )

});

