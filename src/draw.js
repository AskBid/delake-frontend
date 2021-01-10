function draw(edfJSON) { 
  const arc = d3.arc();
  const ribbon = d3.ribbonArrow();
  const sum_sizes = make_angular(edfJSON);
  let edfARR = Object.keys(edfJSON)
  const delegation_color = '#69db8f';

  let width = document.getElementsByClassName("chart_container")[0].offsetWidth;
  let height = document.getElementsByClassName("chart_container")[0].offsetHeight ;
  let minimum_dimension = Math.min(width, height);
  let inner_rad = parseInt((minimum_dimension/2))-50
  let outer_rad = inner_rad + (inner_rad / 20)
  let top_rad = (pool_id) => {
    const max_outer_rad_addition = (outer_rad - inner_rad) * 0.5;
    const biggest_pool_guess = 80000000;
    const rad_addition = (edfJSON[pool_id].size / biggest_pool_guess) * max_outer_rad_addition;
    return outer_rad + rad_addition
  }

  const pool_opacity = 1;
  const pool_stroke_width = 0.2;
  const pool_stroke_opacity = 0.7;
  const ribbon_opacity = 0.5;
  const ribbon_stroke_width = 0.1;
  const ribbon_stroke_opacity = 1;

  let svg = d3.select(".chart_container")
  .append("svg")

  //https://github.com/d3/d3-scale-chromatic
  //https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
  var color = d3.scaleOrdinal().domain(edfARR)
    .range(d3.schemePastel1);

  svg.attr("width", '100%')
    .attr("height",  '100%')
    .style("background", "#fff");

  let g = svg.append('g')
    .attr("transform", `translate(${outer_rad+50}, ${outer_rad+50})`);

  draw_chord()
  edfARR.forEach(pool_id => draw_ribbon(pool_id, edfJSON[pool_id].from))
  add_listeners()

  function draw_chord() {
    g.selectAll("path .chord")
    .data(edfARR)
    .enter()
    .append("path")
    .style("fill", function(d, i) {
      edfJSON[d].color = color(i);
      return color(i); 
    })
    .style("opacity", pool_opacity)
    .attr("d", function(d, i){
      const obj = edfJSON[d]
      if (obj.size > 50000000) {
        draw_ticker_text(obj, 'chart_ticker', color(i));
        console.log(obj.size)
      }
      return arc({
        outerRadius: top_rad(d),
        innerRadius: inner_rad,
        startAngle: obj.arc.start,
        endAngle: obj.arc.end,
        padAngle: 0,
        padRadius: 0,
        cornerRadius: 1})
      })
    .style('stroke', 'black')
    .style("stroke-width", pool_stroke_width)
    .style("stroke-opacity", pool_stroke_opacity)
    .attr("tick", d => edfJSON[d].ticker)
    .attr("pool_id", d => d)
    .attr("class", "chord")
    .attr("color", function(d, i) {
      edfJSON[d].color = color(i);
      return color(i); 
    })
  }

  function draw_ticker_text(obj, class_type, color) {
    const rotation = rad_to_deg(arc_middle(obj.arc))
    g.append('text')
    .attr("x", outer_rad + 15)
    .attr("y", 2.2)
    .attr('class', class_type)
    .style('fill', color)
    .text(obj.ticker)
    .attr('transform', `rotate(${rotation-90} 0 0)`)
  }

  function draw_ribbon(to, from) {
    g.selectAll("path .ribbon")
      .data(Object.keys(from))
      .enter()
      .append("path")
      .attr("fill", function(d, i) { 
        if (d === 'new_delegation') {
          return delegation_color;
        }
        return edfJSON[d].color; 
      })
      .style("opacity", ribbon_opacity)
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
            source: {startAngle: source_arc.start, endAngle: source_arc.end, radius: inner_rad},
            target: {startAngle: target_arc.start, endAngle: target_arc.end, radius: inner_rad}
          })
        } else {
          // if it is a "new_delegation"
          const top_rad_ = top_rad(to)
          return arc({
            outerRadius: top_rad_ + 20,
            innerRadius: top_rad_ + 5,
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
      .style("stroke-width", ribbon_stroke_width)
      .style("stroke-opacity", ribbon_stroke_opacity)
      // .attr('info', function(from) {if (from != 'new_delegation') {return `${from} ${edfJSON[from].ticker}`}})
      .attr("class", "ribbon")
      .attr("from", from => from)
      .attr("to", to)
  } 

  function add_listeners() {
    d3.selectAll(".chord")
    .on("mouseover", function(){
      d3.select(this)
        .style("fill", 'red')

      const ticker = d3.select(this).attr("ticker")
      const id = d3.select(this).attr("pool_id")

      d3.selectAll(".ribbon")
        .style("opacity", 0)
        .style("stroke-opacity", 0)

      d3.selectAll(`path[from="${id}"]`)
        .style("fill", 'red')
        .style("stroke", 'red')
        .style("opacity", 1)
        .style("stroke-width", 1)
        .style("stroke-opacity", 1)
        // .style("stroke-opacity", 1)

      d3.selectAll(`path[to="${id}"]`)
        .style("opacity", 1)
        .style("stroke-width", 2)
        .style("stroke-opacity", 1)
        // .style("fill", 'blue')

      // document.getElementById('ticker').innerHTML = ticker
      // d3.select(this)
        // .style("background-color", "orange");
      // Get current event info
      // console.log(d3.event);
      // Get x & y co-ordinates
      // console.log(d3.mouse(this));
    })
    .on("mouseout", function(){
      const color = d3.select(this).attr("color")

      d3.select(this)
        .style("fill", color)

      const ticker = d3.select(this).attr("ticker")
      const id = d3.select(this).attr("pool_id")

      d3.selectAll(".ribbon")
        .style("opacity", ribbon_opacity)
        .style("stroke-opacity", ribbon_stroke_opacity)
        .style("stroke-width", ribbon_stroke_width)
      
      d3.selectAll(`path[from="${id}"]`)
        .style("fill", color)
        .style("stroke", color)
        // .style("stroke-width", ribbon_stroke_width)
        // .style("stroke-opacity", 0.7)
        // .style("opacity", 0.1)

      // d3.selectAll(`path[to="${id}"]`)
        // .style("fill", function(d) {debugger;})
        // .style("stroke-opacity", 0.7)
        // .style("opactiy", 0.5)
        // .style("stroke", color)

      // d3.select(this)
      //   .style("background-color", "steelblue")
    }); 
  }
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

function rad_to_deg(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
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