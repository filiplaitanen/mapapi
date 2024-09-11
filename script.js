// elements & consts
const textInput = document.querySelector('#input');
const mapElement = document.querySelector('#map');
const imageElement = document.querySelector('#image-container');

const inspect = {
    image: document.querySelector('#inspect-panel .inspect-image-style'),
    title: document.querySelector('#inspect-panel .title-style'),
    description: document.querySelector('#inspect-panel .text-style'),
    tags: document.querySelector('#inspect-panel #inspect-tags'),
    element: document.querySelector('#inspect-panel')
}
const templates = {
    tag: document.querySelector('#tag-template')
}
const image_count = 10;

//#region leaflet.js
var geomap = L.map('map').setView([0, 0],13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(geomap);

var geocoder = L.Control.Geocoder.nominatim()

//#endregion leaflet.js
//#region our functions
function setAdress(adress) {
  geocoder.geocode(adress, function(results) {
    var r = results[0];
    if (r) {
        geomap.fitBounds(r.bbox);
      L.marker(r.center).addTo(geomap)
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

async function SearchByCoordinates(lat, lon){
    const fetched = await FetchFlickr("flickr.photos.search", "lat="+lat+"&lon="+lon+"&has_geo=1&media=photos&per_page=10");
    const photos = fetched["photos"]["photo"]
    return photos;
}

async function InsertImages(tags){
    const fetched = await FetchFlickr("flickr.photos.search", "tags="+tags+"&has_geo=1&media=photos&per_page=10");
    console.log(fetched["photos"]["photo"])
    const photos = fetched["photos"]["photo"]

    for(let i = 0; i < Math.min(photos.length, image_count); i++){
        imageElement.children[i].src = "https://live.staticflickr.com/"+photos[i]["server"]+"/"+photos[i]["id"]+"_"+photos[i]["secret"]+".jpg";
    }
}

function Search(){
    if (textInput.value != "") {
        InsertImages(textInput.value);
        textInput.value = "";
    }
}

async function onMapClick(e) {
    const [lat, lng] = [e.latlng.lat, e.latlng.lng]
    const imgs = await SearchByCoordinates(lat, lng);
    if (imgs.length == 0){
        return;
    }
    for(let i = 0; i < image_count; i++){
        imageElement.children[i].src = "https://live.staticflickr.com/"+imgs[i]["server"]+"/"+imgs[i]["id"]+"_"+imgs[i]["secret"]+".jpg";
    }
}

// event listeners
/*
var [lattempd, lngtempd] = [0,0];
var [lattempu, lngtempu] = [0,0];
mapElement.addEventListener('mousedown', (e) => {
    [lattempd, lngtempd] = Object.values(geomap.getCenter());
});

var marker;

mapElement.addEventListener('mouseup', (e) => {
    [lattempu, lngtempu] = Object.values(geomap.getCenter());
    if( lattempu == lattempd && lngtempu == lngtempd ){
        try{geomap.removeLayer(marker);} catch {}
        marker = new L.marker([lattempu,lngtempu]).addTo(geomap)
        geomap.addLayer(marker)
        console.log(L.control.mousePosition())
        onMapClick();
    }
});
*/
geomap.on('click', function(e){
    alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)
    try{geomap.removeLayer(marker);} catch {}
    marker = new L.marker([e.latlng.lat, e.latlng.lng]).addTo(geomap)
    geomap.addLayer(marker)
    onMapClick(e);
});

textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && textInput.value != "") {
    InsertImages(textInput.value);
    textInput.value = "";
    }
});

const images = document.getElementsByClassName("image-style");
Array.prototype.slice.call(images).forEach(element => {
    var imageInfo = {};
    var coordinates = [0,0];
    element.addEventListener('click', async (event) => {
        const infoAns = await FetchFlickr("flickr.photos.getInfo", "photo_id="+element.src.split("/")[4].split("_")[0])
        imageInfo = infoAns["photo"];
        coordinates[0] = infoAns["photo"]["location"]["latitude"];
        coordinates[1] = infoAns["photo"]["location"]["longitude"];
       
        inspect.image.src = element.src;
        inspect.title.innerHTML = imageInfo["title"]["_content"];
        inspect.description.innerHTML = imageInfo["description"]["_content"];
        inspect.tags.innerHTML = "";
        imageInfo["tags"]["tag"].forEach(tag => {
            var tagElement = templates.tag.cloneNode(true);
            tagElement.id = ''
            tagElement.innerHTML = tag["_content"];
            inspect.tags.appendChild(tagElement);
        });

    });
});


// init



