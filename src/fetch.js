const BACKEND_URL = 'http://localhost:3000'

function getEpochs() {
	return fetch(`${BACKEND_URL}/epoch_pool_sizes/epochs`,{
	    method:'GET',
	    headers: {
	      "Content-Type":"application/json",
	      "Accept": "application/json"
	    }
	  })
	  .then(resp=>resp.json())
	  .then(obj=> {
	  	return obj
	  })
}