let map;
let service;
let infowindow;
let defaultZoomValue = 12;

let searchUrl = "https://www.google.com/maps/dir/?api=1&query="

// icon 
let iconUrl = 'https://uploads-ssl.webflow.com/65b20e63cd6e984ed662a112/65b20e63cd6e984ed662a141_vaccination%20marker%402x.png';
let size = 10;

const searchRequests = {
    keyword: "hpv center",
    rankBy: "DISTANCE"
}

const setPosition = async (userLocation) => {
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");

    const { PlacesService } = await google.maps.importLibrary('places');

    // userLocation = {
    //     lat: 26.985608,
    //     lng: 83.382752
    // }

    map = new Map(document.getElementById("map1"), {
        center: userLocation,
        zoom: defaultZoomValue,
    });
    service = new PlacesService(map);

    // search api
    const request = {
        keyword: "hpv",
        // fields: ["All"],
        type: ["hospital", "doctor"],
        radius: '10000',
        // rankBy: 'DISTANCE',
        location: userLocation
    };

    console.log(userLocation);
    service.nearbySearch(request, (results, status) => {
        console.log(results);
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            for (let i = 0; i < results.length; i++) {
                createMarker(results[i]);
            }

            map.setCenter(results[0].geometry.location);
        }
    });

    const icon = {
        url: iconUrl, // url
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    function smoothZoom(currentmap, max, cnt) {
        if (cnt >= max) {
            return;
        }
        else {
            y = google.maps.event.addListener(currentmap, 'zoom_changed', function (event) {
                google.maps.event.removeListener(y);
                smoothZoom(currentmap, max, cnt + 1);
            });
            setTimeout(function () { currentmap.setZoom(cnt) }, 80);
        }
    }


    function createMarker(place) {
        if (!place.geometry || !place.geometry.location) return;

        // user marker
        new google.maps.Marker({
            map,
            position: userLocation
        })

        const marker = new google.maps.Marker({
            map,
            position: place.geometry.location,
            icon
        });

        google.maps.event.addListener(marker, "click", () => {
            if (infowindow) infowindow.close()

            infowindow = new InfoWindow({
                ariaLabel: 'hpv vaccine center',
                position: place.geometry.location
            });

            infowindow.setContent(infoElement(place.name, place.vicinity) || "");
            infowindow.open({
                anchor: marker,
                map
            });
        });

        // zooms in
        google.maps.event.addListener(marker, "dblclick", () => {
            map = marker.getMap();

            map.setCenter(marker.getPosition()); // set map center to marker position
            smoothZoom(map, 20, map.getZoom()); // call smoothZoo
        });

    }
}



function noLoactionError(position) {
    // new Map(document.getElementById("map"), {
    //     center: {lat: 28.567573093370907, lng: 77.20990374154427},
    //     zoom: defaultZoomValue,
    // });
    setPosition({
        lat: 28.567573093370907, lng: 77.20990374154427
    })
}

async function initMap() {

    let userLocation = null;
    if (navigator.geolocation) {
        try {
            navigator.geolocation.getCurrentPosition(function (position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                setPosition(userLocation)
            }, noLoactionError);
            console.log('inside');
        } 
        catch (error) {
            console.log('error');
            setPosition({
                lat: 28.567573093370907, lng: 77.20990374154427
            })
        }

    }
    else {
        setPosition({
            lat: 28.567573093370907, lng: 77.20990374154427
        })
    }

}

const infoElement = (placename, address) => {
    return `
    <div>
        <div>${placename}</div>
        <a href="https://www.google.com/maps/search/?api=1&query=${placename + address}" target="_blank">view on google maps</a>
    </div>
    `
}

initMap();