let ticker_limit = 50000000

function draw(edfJSON, range) {
  console.log(edfJSON )
  let filtered_edfJSON = {...edfJSON}
  if (range) { filtered_edfJSON = filterPools(edfJSON) }
  console.log(filtered_edfJSON )
  const arc = d3.arc();
  const ribbon = d3.ribbonArrow();
  const sum_sizes = make_angular(filtered_edfJSON);
  let edfARR = Object.keys(filtered_edfJSON)
  const delegation_color = '#69db8f';
  const filtered_pools_color = 'rgba(150,150,150,0.3)';

  //positioning and proportions START
  let width = document.getElementsByClassName("chart_container")[0].offsetWidth;
  let height = document.getElementsByClassName("chart_container")[0].offsetHeight;

  let minimum_dimension = Math.min(width, height);
  let textRatio = 10 / 340;

  let zoom = 0.65;
  if (width < 700) {
    zoom = 0.90
  }
  let inner_rad = parseInt(((minimum_dimension*zoom)/2))
  let ticker_size = `${parseInt(textRatio*inner_rad)}px`
  let outer_rad = inner_rad + (inner_rad / 22)
  const max_outer_rad_addition = (outer_rad - inner_rad) * 0.5;
  let max_rad = outer_rad + max_outer_rad_addition

  let top_rad = (ph_id) => {
    const biggest_pool_guess = 80000000;
    const rad_addition = (filtered_edfJSON[ph_id].size / biggest_pool_guess) * max_outer_rad_addition;
    return outer_rad + rad_addition
  }

  let tab_width = document.getElementsByClassName("delegation_tab")[0].offsetWidth;
  let chart_top_padding = 80;
  let gap_to_fix_position_when_on_small_width = 0;

  if (((width - (max_rad*2)) / 2) < 230) {
    let addition = width < 800 ? 20 : 0
    d3.select(".delegation_tab")
      .style('margin-top', `${(max_rad*2)+(chart_top_padding/2)+addition}px`);
      gap_to_fix_position_when_on_small_width = 40
  } else {
    d3.select(".delegation_tab")
      .style('margin-top', '0px');
  }

  let center_translation_h = width/2;
  let center_translation_v = max_rad + chart_top_padding + gap_to_fix_position_when_on_small_width
  //positioning and proportions END

  const pool_opacity = 0.6;
  const pool_stroke_width = 0.2;
  const pool_stroke_opacity = 0.6;
  const ribbon_opacity = 0.4;
  const ribbon_stroke_width = 0.1;
  const ribbon_stroke_opacity = 0.6;

  d3.select(".chart_container").select('svg').remove()
  let svg = d3.select(".chart_container")
    .append("svg")

  //https://github.com/d3/d3-scale-chromatic
  //https://bl.ocks.org/EfratVil/2bcc4bf35e28ae789de238926ee1ef05
  var color = d3.scaleOrdinal().domain(edfARR)
    .range(d3.schemeTableau10);

  svg.attr("width", '100%')
    .attr("height",  '100%')
    .style("background", "#fff");

  let g = svg.append('g')
    .attr("transform", `translate(${center_translation_h}, ${center_translation_v})`);

  draw_chord()
  edfARR.forEach(ph_id => draw_ribbon(ph_id, filtered_edfJSON[ph_id].from))
  add_listeners()

  function draw_chord() {
    g.selectAll("path .chord")
    .data(edfARR)
    .enter()
    .append("path")
    .style("fill", function(d, i) {
      if (d === 'excluded') {
        filtered_edfJSON[d].color = filtered_pools_color
        return filtered_pools_color; 
      } else {
        filtered_edfJSON[d].color = color(i);
        return color(i); 
      }
    })
    .style("opacity", pool_opacity)
    .attr("d", function(d, i){
      const obj = filtered_edfJSON[d]
      if (obj.size > ticker_limit || Object.keys(filtered_edfJSON).length < 140) {
        let colortick = d === 'excluded' ? 'black' : filtered_edfJSON[d].color
        draw_ticker_text(obj, 'chart_ticker', colortick);
      }
      let outerRadius = top_rad(d)
      if (d === 'excluded') {outerRadius = inner_rad}
      return arc({
        outerRadius: outerRadius,
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
    .attr("tick", d => filtered_edfJSON[d].ticker)
    .attr("ph_id", d => d)
    .attr("class", "chord")
    .attr("color", function(d, i) {
      return filtered_edfJSON[d].color
    })
  }

  function draw_ticker_text(obj, class_type, color) {
    const rotation = rad_to_deg(arc_middle(obj.arc))
    if (rotation < 180) {
      g.append('text')
      .attr("x", max_rad + 13)
      .attr("y", 2.2)
      .attr('class', class_type)
      .attr('ticker', obj.ticker)
      // .attr('ph_id', id)
      // .attr('color', color)
      .style('fill', color)
      .style('font-size', ticker_size)
      .text(obj.ticker)
      .attr('transform', `rotate(${rotation-90} 0 0)`)
    } else {
      g.append('text')
      .attr("x", -(max_rad + 13))
      .attr("y", 2.2)
      .attr('class', class_type)
      .attr('ticker', obj.ticker)
      .style('font-size', ticker_size)
      // .attr('ph_id', id)
      // .attr('color', color)
      .style('fill', color)
      .text(obj.ticker)
      .attr('transform', `rotate(${rotation+90} 0 0)`)
      .attr("text-anchor", "end")
    }
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
        return filtered_edfJSON[d] ? filtered_edfJSON[d].color : filtered_pools_color; 
      })
      .style("opacity", ribbon_opacity)
      .attr("d", function(from_id) {
        const target = filtered_edfJSON[to];
        const t_middle = arc_middle(target.arc);
        const dele_size = from[from_id]
        const arc_size = (dele_size / sum_sizes) * (Math.PI * 2);
        if (dele_size === 0) {return null}
        if (!(from_id === 'new_delegation')) {
          if (!filtered_edfJSON[from_id]) { 
            from_id = 'excluded'
          }
          let source = filtered_edfJSON[from_id];
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
            outerRadius: top_rad_ + 8,
            innerRadius: top_rad_ + 3,
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
        return filtered_edfJSON[d] ? filtered_edfJSON[d].color : filtered_pools_color; 
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

      // const ticker = d3.select(this).attr("ticker")
      const id = d3.select(this).attr("ph_id")

      draw_ticker_text(filtered_edfJSON[id], 'chart_ticker_select', 'red')

      d3.selectAll(".ribbon")
        .style("opacity", 0)
        .style("stroke-opacity", 0)

      d3.selectAll(`path[from="${id}"]`)
        .style("fill", 'red')
        .style("stroke", 'red')
        .style("opacity", 1)
        .style("stroke-width", 1)
        .style("stroke-opacity", 0.5)

      d3.selectAll(`path[to="${id}"]`)
        .style("fill", 'blue')
        .style("stroke", 'blue')
        .style("opacity", 1)
        .style("stroke-width", 1)
        .style("stroke-opacity", 0.5)
    })
    .on("mouseout", function(){
      const color = d3.select(this).attr("color")

      d3.select(this)
        .style("fill", color)

      // const ticker = d3.select(this).attr("ticker")
      const id = d3.select(this).attr("ph_id")

      d3.selectAll('.chart_ticker_select').remove()

      d3.selectAll(".ribbon")
        .style("opacity", ribbon_opacity)
        .style("stroke-opacity", ribbon_stroke_opacity)
        .style("stroke-width", ribbon_stroke_width)
      
      d3.selectAll(`path[from="${id}"]`)
        .style("fill", color)
        .style("stroke", color)
      let paths = document.querySelectorAll(`path[to='${id}']`);
      paths.forEach((path)=>{
        let col = path.getAttribute('fill')
        path.style.fill = col
        path.style.stroke = col
      })

    })
    .on("click", function(){
      const ticker = d3.select(this).attr("tick")
      const id = d3.select(this).attr("ph_id")
      let tos = {}

      const balance = calculate_balance(id, edfJSON, tos)

      document.getElementById('select_pool_ticker').innerHTML = ticker;
      document.getElementById('pool_size').innerHTML = `${numeral(edfJSON[id].size).format('0,0')} ₳`;
      document.getElementById('pool_balance').innerHTML = `${numeral(balance).format('0,0')} ₳`;
      if (balance < 0) {
        d3.select('#pool_balance')
        .style('color', 'red')
      } else {
        d3.select('#pool_balance')
        .style('color', 'green')
      }
      document.getElementById('out').getElementsByTagName('span')[0].innerHTML = '';
      document.getElementById('in').getElementsByTagName('span')[0].innerHTML = '';
      // console.log(edfJSON[id].from)
      deployFromTo(tos, 'out', edfJSON)
      deployFromTo(edfJSON[id].from, 'in', edfJSON)
    }); 
  }
}


function deployFromTo(obj, type, edfJSON) {
  Object.keys(obj).forEach((key)=>{
    function appendString(string) {
      var div = document.createElement('div');
      div.innerHTML = string.trim();
      document.getElementById(type)
        .getElementsByTagName('span')[0]
        .appendChild(div.firstChild); 
    }
    if (key === 'new_delegation') {
      appendString(`<div class="pool_ticker" style='color:green'>New Delegats</div>`)
    } else {
      // appendString(`<div class="pool_ticker" style="color:${edfJSON[key].color}">${edfJSON[key].ticker}</div>`)
      // console.log(key)
      appendString(`<div class="pool_ticker" style="color:grey">${edfJSON[key].ticker}</div>`)
    }
    appendString(`<div class="tab_value">${numeral(obj[key]).format('0,0')} ₳</div>`)
  })
}


function calculate_balance(id, edfJSON, tos) {
  let sum_to = 0
  let sum_from = 0

  Object.keys(edfJSON[id].from).forEach((from_key)=>{
    sum_from += edfJSON[id].from[from_key]
  })

  Object.keys(edfJSON).forEach((key) => {
    Object.keys(edfJSON[key].from).forEach((from_key)=>{
      if (from_key === id) {
        sum_to += edfJSON[key].from[from_key]
        tos[key] = edfJSON[key].from[from_key]
      }
    })
  })
  return sum_from - sum_to
}

function getInIds(id, edfJSON) {
  let arr = []
  Object.keys(edfJSON).forEach((key) => {
    Object.keys(edfJSON[key].from).forEach((from_key)=>{
      if (from_key === id) {
        arr.push(key)
      }
    })
  })
  return arr
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

function rad_to_deg(radians) {
  var pi = Math.PI;
  return radians * (180/pi);
}

function filterPools(edfJSON) {
  let poolsize_min = $( "#slider-range" ).slider( "values", 0 ) 
  let poolsize_max = $( "#slider-range" ).slider( "values", 1 ) 
  ticker_limit = poolsize_min + ((poolsize_max - poolsize_min)/2)
  let new_edfJSON = {}
  let excluded = {size: 0, from: {}, ticker: 'Filtered Pools', pool_id: null}
  let accepted_sum = 0
  Object.keys(edfJSON).forEach((k) => {
    if (edfJSON[k].size < poolsize_max && edfJSON[k].size > poolsize_min) {
      new_edfJSON[k] = edfJSON[k]
      accepted_sum += edfJSON[k].size
    } else {
      Object.keys(edfJSON[k].from).forEach((key) => {
        if (excluded.from[key]) {
          excluded.from[key] += edfJSON[k].from[key]
        } else {
          const v = edfJSON[k].from[key]
          excluded.from[key] = v
        }
      })
    }
  })
  Object.keys(excluded.from).forEach((k) => {
    if (!new_edfJSON[k]) {
      delete excluded.from[k]
    }
  })
  excluded.size = accepted_sum / 10
  new_edfJSON.excluded = excluded
  return new_edfJSON
}

function make_angular(edfJSON) {
  const sum = Object.keys(edfJSON).reduce((a, k) => a + edfJSON[k].size, 0);
  const t = Math.PI * 2;
  const angular = Object.keys(edfJSON).forEach((k) => {
    edfJSON[k].angular_size = (edfJSON[k].size / sum) * t
  });
  let previous = 0;
  Object.keys(edfJSON).forEach((k) => {
    const arc = {start: previous, end: previous + edfJSON[k].angular_size}
    previous += edfJSON[k].angular_size
    edfJSON[k].arc = arc
  })
  return sum
}