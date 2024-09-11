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

L.Control.MousePosition = L.Control.extend({

	_pos: null,

	options: {
		position: 'bottomleft',
		separator: ' : ',
		emptyString: 'Unavailable',
		lngFirst: false,
		numDigits: 5,
		lngFormatter: undefined,
		latFormatter: undefined,
		prefix: ""
	},

	onAdd: function (map) {
		this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
		L.DomEvent.disableClickPropagation(this._container);
		map.on('mousemove', this._onMouseMove, this);
		this._container.innerHTML = this.options.emptyString;
		return this._container;
	},

	onRemove: function (map) {
		map.off('mousemove', this._onMouseMove)
	},

	getLatLng: function() {
		return this._pos;
	},

	_onMouseMove: function (e) {
		this._pos = e.latlng.wrap();
		var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.wrap().lng) : L.Util.formatNum(e.latlng.wrap().lng, this.options.numDigits);
		var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
		var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
		this._container.innerHTML = this.options.prefix + ' ' + value;
	}

});

L.Map.mergeOptions({
	positionControl: false
});

L.Map.addInitHook(function () {
	if (this.options.positionControl) {
		this.positionControl = new L.Control.MousePosition();
		this.addControl(this.positionControl);
	}
});

L.control.mousePosition = function (options) {
	return new L.Control.MousePosition(options);
};

L.control.mousePosition().addTo(geomap);

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
    const [lat, lng] = Object.values(geomap.getCenter())
    const imgs = await SearchByCoordinates(lat, lng);
    if (imgs.length == 0){
        return;
    }
    for(let i = 0; i < image_count; i++){
        imageElement.children[i].src = "https://live.staticflickr.com/"+imgs[i]["server"]+"/"+imgs[i]["id"]+"_"+imgs[i]["secret"]+".jpg";
    }
}

// event listeners
mapElement.addEventListener('dblclick', onMapClick);

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



