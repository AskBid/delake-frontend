class AppStorage {
}


document.addEventListener("DOMContentLoaded", () => {


	AppStorage.epoch = new Epoch(210,253)
	AppStorage.epoch.displayEpoch()
	AppStorage.epoch.checkEpochButtonState()
	let DATA;
	render()
	sliderRun()

	button = document.getElementById('prev');
	button.addEventListener('click', function(event) {
		event.preventDefault();
		AppStorage.epoch.changeEpoch(this);
	});
	button = document.getElementById('next');
	button.addEventListener('click', function(event) {
		event.preventDefault();
		AppStorage.epoch.changeEpoch(this);
	});
})

function render() {
	$.getJSON(`assets/edf${AppStorage.epoch.current}.json`, function(data) {
		DATA = data
	  draw(data)
	});
}

class Epoch {
	constructor(min, max) {
		this.min = min;
		this.max = max;
		this.current = max;
	}

	move(move) {
		if (this.current + move <= this.max && this.current + move >= this.min) {
			this.current += move
		}
	}

	changeEpoch(element) {
		let move = element.id === 'next' ? 1 : -1
		this.move(move);
		this.displayEpoch();
		this.checkEpochButtonState();
		render();
	}

	displayEpoch() {
		if (this) {
			document.getElementById('writing').innerHTML = `epoch ${this.current}`;
		} else {
			document.getElementById('writing').innerHTML = `null epoch!`;
		}
	}

	checkEpochButtonState() {
		if (this.current === this.max) {
				document.getElementById("next").disabled = true;
		} else {
				document.getElementById("next").disabled = false;
		}
		if (this.current === this.min) {
			document.getElementById("prev").disabled = true;
		} else {
			document.getElementById("prev").disabled = false;
		}
	}



	// static fetchEpochInfo() {
	// 	return fetch(`${AppStorage.BACKEND_URL()}/epoch`,{
	//     method:'GET',
	//     headers: {
	//       "Content-Type":"application/json",
	//       "Accept": "application/json"
	//     },
	//   })
	//   .then(resp=>resp.json())
	//   .then(obj=> {
	//   	AppStorage.epoch = new Epoch(obj.min, obj.max, obj.max);
	//   	AppStorage.epoch.displayEpoch()
	//   	AppStorage.epoch.checkEpochButtonState()
	//   })
	// }
}

function sliderRun() {
  $( "#slider-range" ).slider({
    range: true,	
    min: 25000,
    max: 144000000,
    step: 100000,
    values: [ 50000, 144000000 ],
    slide: function( event, ui ) {
      $( "#amount" ).val("₳" + numeral(ui.values[ 0 ]).format('0a') + " - ₳" + numeral(ui.values[ 1 ]).format('0a'));
    }
  });
  $( "#amount" ).val("₳" + numeral($( "#slider-range" ).slider( "values", 0 )).format('0a') + " - ₳" + numeral($( "#slider-range" ).slider( "values", 1 )).format('0a'));
  $( "#slider-range" ).slider({
	  change: function( event, ui ) {
	  	draw(DATA, true)
	  }
	});
}


// debugger

// let json = {
//   '30':{'from':{'32':7483},
//    'size':34442716,
//    'ticker':"CANUK",
//    'pool_id':1962},
//   '31':{'from':{'32':7483, '33':194879, '34':82895, '35':1012},
//    'size':34442716,
//    'ticker':"CANUK1",
//    'pool_id':1962},
//   '32':{'from':{'30':7483, "new_delegation":194879, '35':82895},
//    'size':34442716,
//    'ticker':"CANUK2",
//    'pool_id':1962},
//   '33':{'from':{'32':7483, '30':194879, '34':82895, '35':1012},
//    'size':34442716,
//    'ticker':"CANUK3",
//    'pool_id':1962},
//   '34':{'from':{'32':748300},
//    'size':34442716,
//    'ticker':"CANUK4",
//    'pool_id':1962},
//   '35':{'from':{'30':7483, '31':194879, '32':82895, '33':1012},
//    'size':34442716,
//    'ticker':"CANUK5",
//    'pool_id':1962}}