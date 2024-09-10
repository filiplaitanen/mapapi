
async function SearchImage(){
    const response = await fetch("https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=321f88dd6522f5ca711e9518babee1ac&tags=tree,water&format=json&nojsoncallback=1&has_geo=1&per_page=10");

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

async function FetchFlickr(method, param){
    const response = await fetch("https://www.flickr.com/services/rest/?method="+method+"&api_key=321f88dd6522f5ca711e9518babee1ac&format=json&nojsoncallback=1&"+param);
    const data = await response.json(); 
    console.log(data);  
    return data;
}

const images = document.getElementsByClassName("image-style");
Array.prototype.slice.call(images).forEach(element => {
    element.addEventListener('click', (event) => {
        FetchFlickr("flickr.photos.geo.getLocation", "photo_id="+element.src.split("/")[4].split("_")[0])
    });
});


SearchImage();

