document.addEventListener("DOMContentLoaded", () => {
	getEDF(6)
	// $.getJSON('assets/edf241.json', function(data) {
	//   draw(data)
	// });
})


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