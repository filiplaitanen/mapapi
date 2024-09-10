
var map = L.map('map').setView([0, 0],13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var geocoder = L.Control.Geocoder.nominatim();

function setAdress(adress) {
  geocoder.geocode(adress, function(results) {
    var r = results[0];
    if (r) {
      map.fitBounds(r.bbox);
      L.marker(r.center).addTo(map)
        .bindPopup(r.html || r.name)
        .openPopup();
    }
  });
}

async function SearchImage(){
    const response = await fetch("https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=321f88dd6522f5ca711e9518babee1ac&tags=tree,water&format=json&nojsoncallback=1&has_geo=1");

    //const data = await response.json(); 
    const data = await response.json(); 
    InsertImages(data);

    console.log(data);  
}

function InsertImages(json){
    const container = document.getElementById("image-container").children;
    const photos = json["photos"]["photo"];
    console.log(photos[0]);

    for(let i = 0; i < container.length; i++){
        container[i].src = "https://live.staticflickr.com/"+photos[i]["server"]+"/"+photos[i]["id"]+"_"+photos[i]["secret"]+".jpg";
    }
}
SearchImage();