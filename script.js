// elements & consts
const textInput = document.querySelector('#input');
const mapElement = document.querySelector('#map');
const imageElement = document.querySelector('#image-container');
const key = "321f88dd6522f5ca711e9518babee1ac";

const search = {
    text: document.querySelector('#search-panel #input'),
    button: document.querySelector('#search-panel button'),
    type: document.querySelector('#search-panel #search-type'),
    sort: document.querySelector('#search-panel #search-sort'),
    order: document.querySelector('#search-panel #search-order'),
}
const inspect = {
    image: document.querySelector('#inspect-panel #inspect-photo'),
    title: document.querySelector('#inspect-panel .title-style'),
    description: document.querySelector('#inspect-panel .text-style'),
    tags: document.querySelector('#inspect-panel #inspect-tags'),
    element: document.querySelector('#inspect-panel')
}
const templates = {
    tag: document.querySelector('#tag-template')
}
const image_count = 10;
let aborre = false;

//#region leaflet.js

const basemaps = {
    StreetView: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
    Satelite:  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
  };

let geomap = L.map(map
, {    center: [0.1, 0],
    zoom: 11,
    layers: basemaps.StreetView
}
);

L.control.layers(basemaps).addTo(geomap);




let geocoder = L.Control.Geocoder.nominatim()

let markerGroup = [];
let latlngs = [];

//#endregion leaflet.js
//#region our functions
function setAdress(adress) {
  geocoder.geocode(adress, function(results) {
    let r = results[0];
    if (r) {
        geomap.fitBounds(r.bbox);
    

    }
  });
}

async function FetchFlickr(method, param){
    const response = await fetch(`https://www.flickr.com/services/rest/?method=${method}&api_key=${key}&format=json&nojsoncallback=1&${param}`);
    const data = await response.json(); 
    console.log(data);  
    return data;
}

async function SearchByCoordinates(lat, lon){
    const fetched = await FetchFlickr("flickr.photos.search", `lat=${lat}&lon=${lon}&has_geo=1&media=photos&per_page=10&extras=geo`);
    const photos = fetched["photos"]["photo"]

    MarkImages(photos)

    return photos;
}

async function InsertImages(input, type="text", sort="relevance", order="asc") {
    let query = "has_geo=1&per_page=10&extras=geo";
    if (type == "text") {
        query += `&text=${input}`;
    } else if (type == "tag") {
        query += `&tag_mode=all&tags=${input}`;
    }

    if (sort == "relevance") {
        query += `&sort=${sort}`;
    } else {
        query += `&sort=${sort}-${order}`;
    }


    const fetched = await FetchFlickr("flickr.photos.search", query);
    console.log(fetched["photos"]["photo"])
    const photos = fetched["photos"]["photo"]

    for(let i = 0; i < markerGroup.length; i++){
        geomap.removeLayer(markerGroup[i])
    }
    markerGroup = [];
    let latlngs = [];
    MarkImages(photos)

    for(let i = 0; i < Math.min(photos.length, image_count); i++){
        imageElement.children[i].src = "https://live.staticflickr.com/"+photos[i]["server"]+"/"+photos[i]["id"]+"_"+photos[i]["secret"]+".jpg";
        latlngs.push([photos[i]["latitude"], photos[i]["longitude"]])
    }
    let polyline = L.polyline(latlngs, {color: 'red'});

    // zoom the map to the polyline
    geomap.fitBounds(polyline.getBounds());
    
}

function Search(){
    if (textInput.value != "") {
        InsertImages(textInput.value, search.type.value, search.sort.value, search.order.value);
        if (inspect.element.classList.contains('hidden')){
            map.classList.remove('stor-karta');
            imageElement.classList.remove('hidden');
            inspect.element.classList.remove('hidden');
            geomap.invalidateSize(true);
        }
        imageElement.children[0].onload = () =>
        {
            imageClick(imageElement.children[0], false);
        }
        textInput.value = "";
    }
}

async function onMapClick(lat, lng) {
    let latlngs = [];
   
    const imgs = await SearchByCoordinates(lat, lng);
    if (imgs.length == 0){
        return;
    }
    for(let i = 0; i < Math.min(imgs.length, image_count); i++){
        imageElement.children[i].src = `https://live.staticflickr.com/${imgs[i]["server"]}/${imgs[i]["id"]}_${imgs[i]["secret"]}.jpg`;
        latlngs.push([imgs[i]["latitude"], imgs[i]["longitude"]])
    }
    let polyline = L.polyline(latlngs, {color: 'rgba(255, 255, 255, 0.4)'});
  
    // zoom the map to the polyline
    geomap.fitBounds(polyline.getBounds());
}

function MarkImages(imgs){
    for(let i = 0; i < Math.min(imgs.length, image_count);i++){
        //get width and height of image
        
        const icon =  L.icon({ iconUrl: "https://live.staticflickr.com/"+imgs[i]["server"]+"/"+imgs[i]["id"]+"_"+imgs[i]["secret"]+".jpg", iconSize: [50, 50] });  

        market = L.marker([ imgs[i]["latitude"] , imgs[i]["longitude"] ] ,{icon:icon}).on('click', function(e) { MarkerClick(imgs[i]) }).addTo(geomap);
        markerGroup.push( market );
        geomap.addLayer(market)
    }
}

async function MarkerClick(image){
    const element = Object.values(imageElement.children).find(element => element.src == "https://live.staticflickr.com/"+image["server"]+"/"+image["id"]+"_"+image["secret"]+".jpg");
    console.log("https://live.staticflickr.com/"+image["server"]+"/"+image["id"]+"_"+image["secret"]+".jpg");
    imageClick(element);
    


    inspect.image.src = "https://live.staticflickr.com/"+imageInfo["server"]+"/"+imageInfo["id"]+"_"+imageInfo["secret"]+".jpg";
    inspect.title.innerHTML = imageInfo["title"]["_content"];
    inspect.description.innerHTML = imageInfo["description"]["_content"];
    inspect.tags.innerHTML = "";
    imageInfo["tags"]["tag"].forEach(tag => {
        let tagElement = templates.tag.cloneNode(true);
        tagElement.id = ''
        tagElement.innerHTML = tag["_content"];
        inspect.tags.appendChild(tagElement);
    });

    const tags = document.getElementsByClassName("tag-style");
    Array.prototype.slice.call(tags).forEach(element => {
        element.addEventListener('click', (event) => {
            if (map.classList.contains('stor-karta')){
                map.classList.remove('stor-karta');
                imageElement.classList.remove('hidden');
                geomap.invalidateSize(true);
            }
            InsertImages(element.innerHTML);
        });
    } );
}
async function imageClick(element, move = true){
    inspect.element.classList.remove('hidden');
    const infoAns = await FetchFlickr("flickr.photos.getInfo", "photo_id="+element.src.split("/")[4].split("_")[0])
    const imageInfo = infoAns["photo"];
    //coordinates[0] = infoAns["photo"]["location"]["latitude"];
    //coordinates[1] = infoAns["photo"]["location"]["longitude"];
   
    inspect.image.src = element.src;
    inspect.title.innerHTML = imageInfo["title"]["_content"];
    inspect.description.innerHTML = imageInfo["description"]["_content"];
    inspect.tags.innerHTML = "";
    imageInfo["tags"]["tag"].forEach(tag => {
        let tagElement = templates.tag.cloneNode(true);
        tagElement.id = ''
        tagElement.innerHTML = tag["_content"];
        inspect.tags.appendChild(tagElement);
    });

    const tags = document.getElementsByClassName("tag-style");
    Array.prototype.slice.call(tags).forEach(element => {
        element.addEventListener('click', (event) => {
            if (map.classList.contains('stor-karta')){
                map.classList.remove('stor-karta');
                imageElement.classList.remove('hidden');
                geomap.invalidateSize(true);
            }
            InsertImages(element.innerHTML);
        });
    } );

    
    if (inspect.description.innerHTML == ""){
        inspect.description.innerHTML = "No description available";
    }
    if (inspect.title.innerHTML == ""){
        inspect.title.innerHTML = "No title available";
    }
    if (inspect.tags.innerHTML == ""){
        inspect.tags.innerHTML = "No tags available";
    }
    if (move) {
        geomap.panTo([imageInfo["location"]["latitude"], imageInfo["location"]["longitude"]]);
    }
}
// event listeners

geomap.on('click',async function(e){

    if (inspect.element.classList.contains('hidden')){
        map.classList.remove('stor-karta');
        imageElement.classList.remove('hidden');
        inspect.element.classList.remove('hidden');
        geomap.invalidateSize(true);
    }
    for(let i = 0; i < markerGroup.length; i++){
        geomap.removeLayer(markerGroup[i])
    }
    onMapClick(e.latlng.lat, e.latlng.lng);
    imageElement.children[0].onload = () =>
    {
        imageClick(imageElement.children[0], false);
    }
    textInput.value = "";

});

textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && textInput.value != "") {
        if (map.classList.contains('stor-karta')){
            map.classList.remove('stor-karta');
            imageElement.classList.remove('hidden');
            geomap.invalidateSize(true);
        }
        Search();
        textInput.value = "";
    }
});

const images = document.getElementsByClassName("image-style");
Array.prototype.slice.call(images).forEach(element => {
    element.addEventListener('click', (event) => {
        imageClick(element);
    });
} );


// init
setAdress("sweden");

