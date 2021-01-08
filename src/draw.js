function draw(edfJSON) { 
  const arc = d3.arc();
  const ribbon = d3.ribbonArrow();
  const sum_sizes = make_angular(edfJSON);
  let edfARR = Object.keys(edfJSON)
  const delegation_color = '#ccc';

  let svg = d3.select(".container").append("svg");

  let width = document.getElementsByClassName("container")[0].offsetWidth;
  let height = document.getElementsByClassName("container")[0].offsetHeight ;
  let minimum_dimension = Math.min(width, height);
  let min_rad = parseInt((minimum_dimension/2))-50

  //https://github.com/d3/d3-scale-chromatic
  //https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
  var color = d3.scaleOrdinal().domain(edfARR)
    .range(d3.schemePastel1);

  svg.attr("width", '100%')
    .attr("height",  '100%')
    .style("background", "#fff");

  let g = svg.append('g')
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  g.selectAll("path #chord")
    .data(edfARR)
    .enter()
    .append("path")
    .attr("fill", function(d, i) {
      edfJSON[d].color = color(i);
      return color(i); 
    })
    .style("opacity", 1)
    .attr("d", function(d, i){
      return arc({
        outerRadius: min_rad+(edfJSON[d].size/10000000),
        innerRadius: min_rad,
        startAngle: edfJSON[d].arc.start,
        endAngle: edfJSON[d].arc.end,
        padAngle: 0,
        padRadius: 0,
        cornerRadius: 1})
      })
    .style('stroke', 'rgba(0,0,0,0.7)')
    .attr("stroke-width", '0.1')
    .attr("id", d => edfJSON[d].ticker)

  edfARR.forEach(pool_id => draw_ribbon(pool_id, edfJSON[pool_id].from))

  function draw_ribbon(to, from) {
    g.selectAll("path #ribbon")
      .data(Object.keys(from))
      .enter()
      .append("path")
      .attr("fill", function(d, i) { 
        if (d === 'new_delegation') {
          return delegation_color;
        }
        return edfJSON[d].color; 
      })
      .style("opacity", 0.5)
      .attr("d", function(from_id) {
        const target = edfJSON[to];
        const t_middle = arc_middle(target.arc);
        const dele_size = from[from_id]
        const arc_size = (dele_size / sum_sizes) * (Math.PI * 2);
        if (dele_size === 0) {return null}
        if (!(from_id === 'new_delegation')) {
          const source = edfJSON[from_id];
          const s_middle = arc_middle(source.arc);
          const source_arc = deploy_space(source, s_middle, arc_size)
          const target_arc = deploy_space(target, t_middle, arc_size)
          return ribbon({
            source: {startAngle: source_arc.start, endAngle: source_arc.end, radius: min_rad},
            target: {startAngle: target_arc.start, endAngle: target_arc.end, radius: min_rad}
          })
        } else {
          return arc({
            outerRadius: min_rad+50,
            innerRadius: min_rad+(edfJSON[to].size/10000000),
            startAngle: t_middle-(arc_size/2),
            endAngle: t_middle+(arc_size/2),
            padAngle: 0,
            padRadius: 0,
            cornerRadius: 1})
        }
      })
      .style('stroke', function(d, i) { 
        if (d === 'new_delegation') {
          return delegation_color;
        }
        return edfJSON[d].color; 
      })
      .attr("stroke-width", '0.1')
      .attr('id', function(from) {if (from != 'new_delegation') {return `${from} ${edfJSON[from].ticker}`}});
  }

  d3.selectAll("path")
    .on("mouseover", function(){
      // d3.selectAll("path").style("opacity", 0.02)
      d3.select(this).style("opacity", 1)
      const ticker = d3.select(this).attr("id")
      console.log(ticker)
      // d3.select(this)
        // .style("background-color", "orange");
      // Get current event info
      // console.log(d3.event);
      // Get x & y co-ordinates
      // console.log(d3.mouse(this));
    })
    .on("mouseout", function(){
      console.log('out')
      // d3.select(this)
      //   .style("background-color", "steelblue")
    }); 
}


function write_ticker(ticker) {

}


function deploy_space(obj, middle, new_size) {
  let start;
  let end;
  let taken_anticlock;
  let taken_clock;
  let half_pool_arc = (obj.arc.end - obj.arc.start)/2;
  if (!obj.taken_space || obj.taken_space.anticlock === 0 || !obj.taken_space.anticlock || new_size >= half_pool_arc) {
    // if this is the first ribbon placed on this pool's arc
    const half = new_size/2;
    start = middle - half;
    end = middle + half;
    taken_anticlock = half;
    taken_clock = half;
  } else {
    if (obj.taken_space.anticlock <= obj.taken_space.clock) {
      // if there is more space available on the anticlock side of the pool's arc
      end = middle - obj.taken_space.anticlock;
      start = end - new_size;
      taken_anticlock = obj.taken_space.anticlock + new_size;
      taken_clock = obj.taken_space.clock
    } else {
      // if there is more space available on the clock side of the pool's arc
      start = middle + obj.taken_space.clock;
      end = start + new_size;
      taken_clock = obj.taken_space.clock + new_size;
      taken_anticlock = obj.taken_space.anticlock
    }
  };
  obj.taken_space = {anticlock: taken_anticlock, clock: taken_clock}
  return {start: start, end: end}
}


function arc_middle(arc) {
  return arc.start + ((arc.end - arc.start)/2)
}


function make_angular(edfJSON) {
  const sum = Object.keys(edfJSON).reduce((a, k) => a + edfJSON[k].size, 0);
  const t = Math.PI * 2;
  const angular = Object.keys(edfJSON).forEach((k) => {
    edfJSON[k].angular_size = (edfJSON[k].size / sum) * t
  });
  let previous = 0
  Object.keys(edfJSON).forEach((k) => {
    const arc = {start: previous, end: previous + edfJSON[k].angular_size}
    previous += edfJSON[k].angular_size
    edfJSON[k].arc = arc
  })
  return sum
}