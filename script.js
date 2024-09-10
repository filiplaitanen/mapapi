
var map = L.map('map').setView([0, 0],13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var coordinates = [0,0];
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
async function FetchFlickr(method, param){
    const response = await fetch("https://www.flickr.com/services/rest/?method="+method+"&api_key=321f88dd6522f5ca711e9518babee1ac&format=json&nojsoncallback=1&"+param);
    const data = await response.json(); 
    console.log(data);  
    return data;
}

async function InsertImages(tags){
    const container = document.getElementById("image-container").children;
    const fetched = await FetchFlickr("flickr.photos.search", "tags="+tags+"&has_geo=1&media=photos&per_page=10");
    const photos = fetched["photos"]["photo"]
    for(let i = 0; i < container.length; i++){
        container[i].src = "https://live.staticflickr.com/"+photos[i]["server"]+"/"+photos[i]["id"]+"_"+photos[i]["secret"]+".jpg";
    }
}

const textInput = document.getElementById('input');
textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && textInput.value != "") {
    InsertImages(textInput.value);
    textInput.value = "";
    }
});

const images = document.getElementsByClassName("image-style");
Array.prototype.slice.call(images).forEach(element => {
    element.addEventListener('click', (event) => {
        const coordResp = FetchFlickr("flickr.photos.geo.getLocation", "photo_id="+element.src.split("/")[4].split("_")[0])
        coordinates[0] = coordResp["photo"]["location"]["latitude"];
        coordinates[1] = coordResp["photo"]["location"]["longitude"];
        console.log(coordinates)
    });
});
