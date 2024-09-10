
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

setAdress('Berlin, Germany');