const BACKEND_URL = 'http://localhost:3000'

function getEDFepochs() {
	return fetch(`${BACKEND_URL}/epoch_delegations_flows`,{
	    method:'GET',
	    headers: {
	      "Content-Type":"application/json",
	      "Accept": "application/json"
	    }
	  })
	  .then(resp=>resp.json())
	  .then(obj=> {
	  	console.log(obj)
	  })
}

function getEDF(id) {
	return fetch(`${BACKEND_URL}/epoch_delegations_flows/${id}`,{
	    method:'GET',
	    headers: {
	      "Content-Type":"application/json",
	      "Accept": "application/json"
	    }
	  })
	  .then(resp=>resp.json())
	  .then(obj=> {
	  	// console.log(obj)
	  	draw(obj)
	  })
}