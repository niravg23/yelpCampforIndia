mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: foundCampground.geometry.coordinates,
    zoom: 9
});

map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker()
    .setLngLat(foundCampground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup()
        .setHTML(`<h3>${foundCampground.title}</h3><p>${foundCampground.location}</p>`)
    )
    .addTo(map);