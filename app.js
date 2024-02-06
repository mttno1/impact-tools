/* global config csv2geojson turf Assembly $ */
'use strict';

mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo;

let geojsonData = {};
const filteredGeojson = {
    type: 'FeatureCollection',
    features: [],
};

const map = new mapboxgl.Map({
    container: 'map',
    style: config.style,
    center: config.center,
    zoom: config.zoom,
    transformRequest: transformRequest,
});

map.addControl(new mapboxgl.NavigationControl());


// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true
    }).on('geolocate', function(event) {
        var userLocation = [event.coords.longitude, event.coords.latitude];
        sortByDistance(userLocation);
    })
);    

function flyToLocation(currentFeature) {
    map.flyTo({
        center: currentFeature,
        zoom: 15,
    });
}

function createPopup(currentFeature) {
    const popups = document.getElementsByClassName('mapboxgl-popup');
    /** Check if there is already a popup on the map and if so, remove it */
    var cta = currentFeature.properties.URL ? '<div class="sfgov-url-button__container"><div class="field field--type-link __link field__item"><a class="URL-link" href="' + currentFeature.properties.URL + '">' + 'Website' + '</a></div></div>' : '<div><strong>' + '</strong></div>'
    if (popups[0]) popups[0].remove();
    new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h3 font-weight: bold;>' + currentFeature.properties.Location_Name + '</h3>' +
            '<p><strong>Adresse:</strong> ' + currentFeature.properties.Address + ',' + ' ' + currentFeature.properties.Zip + ' ' + currentFeature.properties.City + '</p>' +
            '<p><strong>Beschreibung:</strong> ' + currentFeature.properties.Description + '</p>' +
            '<p><strong>Typ:</strong> ' + currentFeature.properties.Type + '</p>' +
            '<p><strong>Service:</strong> ' + currentFeature.properties.Service + '</p>' +

            cta
        )
        .addTo(map);
}

function buildLocationList(locationData) {
    /* Add a new listing section to the sidebar. */
    const listings = document.getElementById('listings');
    listings.innerHTML = '';
    locationData.features.forEach((location, i) => {
        const prop = location.properties;

        const listing = listings.appendChild(document.createElement('div'));
        /* Assign a unique `id` to the listing. */
        listing.id = 'listing-' + prop.id;

        /* Assign the `item` class to each listing for styling. */
        listing.className = 'item';

        /* Add the link to the individual listing created above. */
        const link = listing.appendChild(document.createElement('button'));
        link.className = 'title';
        link.id = 'link-' + prop.id;
        link.innerHTML =
            '<p style="line-height: 1.5">' + prop[columnHeaders[0]] + '</p>';

        /* Add details to the individual listing. */
        const details = listing.appendChild(document.createElement('div'));
        // Add the Address, Zip and City to the individual listing
        details.innerHTML = prop.Address + ',' + ' ' + prop.Zip + ' ' + prop.City + '</p>';
        // Add Zielgruppe
        if (prop.Category) {
            details.innerHTML += '</br><p><strong>Kategorie:</strong> ' + prop.Category + '</p>';
        }
        // Add Zielgruppe
        if (prop.Target_Group) {
            details.innerHTML += '</br><p><strong>Ziel Gruppe:</strong> ' + prop.Target_Group + '</p>';
        }

        // Add Website address
        if (prop.URL) {
            details.innerHTML += '<br/><a href="' + prop.URL + '\">' + '<strong>Website:</strong>' + ' ' + prop.URL + '</a>';
        }


        details.className = 'content';

        for (let i = 1; i < columnHeaders.length; i++) {
            const div = document.createElement('div');
            div.innerText += prop[columnHeaders[i]];
            div.className;
            details.appendChild(div);
        }

        link.addEventListener('click', function() {
            const clickedListing = location.geometry.coordinates;
            flyToLocation(clickedListing);
            createPopup(location);

            const activeItem = document.getElementsByClassName('active');
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');

            const divList = document.querySelectorAll('.content');
            const divCount = divList.length;
            for (i = 0; i < divCount; i++) {
                divList[i].style.maxHeight = null;
            }

            for (let i = 0; i < geojsonData.features.length; i++) {
                this.parentNode.classList.remove('active');
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            }
        });
    });
}

// Build dropdown list function
// title - the name or 'category' of the selection 
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems) {
    const filtersDiv = document.getElementById('filters');
    const mainDiv = document.createElement('div');
    const filterTitle = document.createElement('h3');
    filterTitle.innerText = title;
    filterTitle.classList.add('py12', 'txt-bold');
    mainDiv.appendChild(filterTitle);

    const selectContainer = document.createElement('div');
    selectContainer.classList.add('select-container', 'center');

    const dropDown = document.createElement('select');
    dropDown.classList.add('select', 'filter-option');

    const selectArrow = document.createElement('div');
    selectArrow.classList.add('select-arrow');

    const firstOption = document.createElement('option');

    dropDown.appendChild(firstOption);
    selectContainer.appendChild(dropDown);
    selectContainer.appendChild(selectArrow);
    mainDiv.appendChild(selectContainer);

    for (let i = 0; i < listItems.length; i++) {
        const opt = listItems[i];
        const el1 = document.createElement('option');
        el1.textContent = opt;
        el1.value = opt;
        dropDown.appendChild(el1);
    }
    filtersDiv.appendChild(mainDiv);
}

// Build checkbox function
// title - the name or 'category' of the selection e.g. 'Languages: '
// listItems - the array of filter items
// To DO: Clean up code - for every third checkbox, create a div and append new checkboxes to it

function buildCheckbox(title, listItems) {
    const filtersDiv = document.getElementById('filters');
    const mainDiv = document.createElement('div');
    const filterTitle = document.createElement('div');
    const formatcontainer = document.createElement('div');
    filterTitle.classList.add('center', 'flex-parent', 'py12', 'txt-bold');
    formatcontainer.classList.add(
        'center',
        'flex-parent',
        'flex-parent--column',
        'px3',
        'flex-parent--space-between-main',
    );
    const secondLine = document.createElement('div');
    secondLine.classList.add(
        'center',
        'flex-parent',
        'py12',
        'px3',
        'flex-parent--space-between-main',
    );
    filterTitle.innerText = title;
    mainDiv.appendChild(filterTitle);
    mainDiv.appendChild(formatcontainer);

    for (let i = 0; i < listItems.length; i++) {
        const container = document.createElement('label');

        container.classList.add('checkbox-container');

        const input = document.createElement('input');
        input.classList.add('px12', 'filter-option');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', listItems[i]);
        input.setAttribute('value', listItems[i]);

        const checkboxDiv = document.createElement('div');
        const inputValue = document.createElement('p');
        inputValue.innerText = listItems[i];
        checkboxDiv.classList.add('checkbox', 'mr6');
        checkboxDiv.appendChild(Assembly.createIcon('check'));

        container.appendChild(input);
        container.appendChild(checkboxDiv);
        container.appendChild(inputValue);

        formatcontainer.appendChild(container);
    }
    filtersDiv.appendChild(mainDiv);
}

const selectFilters = [];
const checkboxFilters = [];

function createFilterObject(filterSettings) {
    filterSettings.forEach((filter) => {
        if (filter.type === 'checkbox') {
            const keyValues = {};
            Object.assign(keyValues, {
                header: filter.columnHeader,
                value: filter.listItems,
            });
            checkboxFilters.push(keyValues);
        }
        if (filter.type === 'dropdown') {
            const keyValues = {};
            Object.assign(keyValues, {
                header: filter.columnHeader,
                value: filter.listItems,
            });
            selectFilters.push(keyValues);
        }
    });
}

function applyFilters() {
    const filterForm = document.getElementById('filters');

    filterForm.addEventListener('change', function() {
        const filterOptionHTML = this.getElementsByClassName('filter-option');
        const filterOption = [].slice.call(filterOptionHTML);

        const geojSelectFilters = [];
        const geojCheckboxFilters = [];

        filteredGeojson.features = [];
        // const filteredFeatures = [];
        // filteredGeojson.features = [];

        filterOption.forEach((filter) => {
            if (filter.type === 'checkbox' && filter.checked) {
                checkboxFilters.forEach((objs) => {
                    Object.entries(objs).forEach(([, value]) => {
                        if (value.includes(filter.value)) {
                            const geojFilter = [objs.header, filter.value];
                            geojCheckboxFilters.push(geojFilter);
                        }
                    });
                });
            }
            if (filter.type === 'select-one' && filter.value) {
                selectFilters.forEach((objs) => {
                    Object.entries(objs).forEach(([, value]) => {
                        if (value.includes(filter.value)) {
                            const geojFilter = [objs.header, filter.value];
                            geojSelectFilters.push(geojFilter);
                        }
                    });
                });
            }
        });

        if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
            geojsonData.features.forEach((feature) => {
                filteredGeojson.features.push(feature);
            });
        } else if (geojCheckboxFilters.length > 0) {
            /*geojCheckboxFilters.forEach((filter) => {
                geojsonData.features.forEach((feature) => {
                    if (feature.properties[filter[0]].includes(filter[1])) {
                        if (
                            filteredGeojson.features.filter(
                                (f) => f.properties.id === feature.properties.id,
                            ).length === 0
                        ) {
                            filteredGeojson.features.push(feature);
                        }
                    }
                });
            });*/

            let categoryFilters = geojCheckboxFilters.filter(filter => filter[0] === 'Category');
            let cityFilters = geojCheckboxFilters.filter(filter => filter[0] === 'City');
            // Kiểm tra số lượng các bộ lọc và xử lý tương ứng
            if (categoryFilters.length > 0 && cityFilters.length === 0) {
                // Xử lý các bộ lọc Category
                categoryFilters.forEach((filter) => {
                    geojsonData.features.forEach((feature) => {
                        if (feature.properties.Category.includes(filter[1])) {
                            if (!filteredGeojson.features.find((f) => f.properties.id === feature.properties.id)) {
                                filteredGeojson.features.push(feature);
                            }
                        }
                    });
                });
            } else if (cityFilters.length > 0 && categoryFilters.length === 0) {
                // Xử lý các bộ lọc City
                cityFilters.forEach((filter) => {
                    geojsonData.features.forEach((feature) => {
                        if (feature.properties.City === filter[1]) {
                            if (!filteredGeojson.features.find((f) => f.properties.id === feature.properties.id)) {
                                filteredGeojson.features.push(feature);
                            }
                        }
                    });
                });
            } else if (categoryFilters.length > 0 && cityFilters.length > 0) {
                // Xử lý cả hai bộ lọc Category và City
                categoryFilters.forEach((categoryFilter) => {
                    cityFilters.forEach((cityFilter) => {
                        geojsonData.features.forEach((feature) => {
                            if (feature.properties.Category.includes(categoryFilter[1]) && feature.properties.City === cityFilter[1]) {
                                if (!filteredGeojson.features.find((f) => f.properties.id === feature.properties.id)) {
                                    filteredGeojson.features.push(feature);
                                }
                            }
                        });
                    });
                });
            }
            if (geojSelectFilters.length > 0) {
                const removeIds = [];
                filteredGeojson.features.forEach((feature) => {
                    let selected = true;
                    geojSelectFilters.forEach((filter) => {
                        if (
                            feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
                            selected === true
                        ) {
                            selected = false;
                            removeIds.push(feature.properties.id);
                        } else if (selected === false) {
                            removeIds.push(feature.properties.id);
                        }
                    });
                });
                let uniqueRemoveIds = [...new Set(removeIds)];
                uniqueRemoveIds.forEach(function(id) {
                    const idx = filteredGeojson.features.findIndex(
                        (f) => f.properties.id === id,
                    );
                    filteredGeojson.features.splice(idx, 1);
                });
            }
        } else {
            geojsonData.features.forEach((feature) => {
                let selected = true;
                geojSelectFilters.forEach((filter) => {
                    if (!feature.properties[filter[0]].includes(filter[1]) &&
                        selected === true
                    ) {
                        selected = false;
                    }
                });
                if (
                    selected === true &&
                    filteredGeojson.features.filter(
                        (f) => f.properties.id === feature.properties.id,
                    ).length === 0
                ) {
                    filteredGeojson.features.push(feature);
                }
            });
        }

        map.getSource('locationData').setData(filteredGeojson);
        buildLocationList(filteredGeojson);
    });
}

function filters(filterSettings) {
    filterSettings.forEach((filter) => {
        if (filter.type === 'checkbox') {
            buildCheckbox(filter.title, filter.listItems);
        } else if (filter.type === 'dropdown') {
            buildDropDownList(filter.title, filter.listItems);
        }
    });
}

function removeFilters() {
    const input = document.getElementsByTagName('input');
    const select = document.getElementsByTagName('select');
    const selectOption = [].slice.call(select);
    const checkboxOption = [].slice.call(input);
    filteredGeojson.features = [];
    checkboxOption.forEach((checkbox) => {
        if (checkbox.type === 'checkbox' && checkbox.checked === true) {
            checkbox.checked = false;
        }
    });

    selectOption.forEach((option) => {
        option.selectedIndex = 0;
    });

    map.getSource('locationData').setData(geojsonData);
    buildLocationList(geojsonData);
}

function removeFiltersButton() {
    const removeFilter = document.getElementById('removeFilters');
    removeFilter.addEventListener('click', () => {
        removeFilters();
    });
}


createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();

const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: true, // Use the geocoder's default marker style
    zoom: 11,
});
map.addControl(geocoder, 'top-left');

function sortAlpha(locations) {
    locations.features.sort(function(a, b) {
        if (a.properties.name < b.properties.name) { return -1; }
        if (a.properties.name > b.properties.name) { return 1; }
        return 0;
    });
    buildLocationList(locations);
};

function sortByDistance(selectedPoint) {
    const options = { units: 'kilometers' };
    let data;
    if (filteredGeojson.features.length > 0) {
        data = filteredGeojson;
    } else {
        data = geojsonData;
    }
    data.features.forEach((data) => {
        Object.defineProperty(data.properties, 'distance', {
            value: turf.distance(selectedPoint, data.geometry, options),
            writable: true,
            enumerable: true,
            configurable: true,
        });
    });

    data.features.sort((a, b) => {
        if (a.properties.distance > b.properties.distance) {
            return 1;
        }
        if (a.properties.distance < b.properties.distance) {
            return -1;
        }
        return 0; // a must be equal to b
    });
    const listings = document.getElementById('listings');
    while (listings.firstChild) {
        listings.removeChild(listings.firstChild);
    }
    buildLocationList(data);
}

geocoder.on('result', (ev) => {
    const searchResult = ev.result;
    sortByDistance(searchResult);
});



map.on('load', () => {
    // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
    console.log('loaded');
    $(document).ready(() => {
        console.log('ready');
        $.ajax({
            type: 'GET',
            url: config.CSV,
            dataType: 'text',
            success: function(csvData) {
                makeGeoJSON(csvData);
            },
            error: function(request, status, error) {
                console.log(request);
                console.log(status);
                console.log(error);
            },
        });
    });

    function makeGeoJSON(csvData) {
        csv2geojson.csv2geojson(
            csvData, {
                latfield: 'Latitude',
                lonfield: 'Longitude',
                delimiter: ',',
            },
            (err, data) => {
                data.features.forEach((data, i) => {
                    data.properties.id = i;
                });

                geojsonData = data;
                // console.log(geojsonData)
                // Add point layer to the map
                map.addSource('locationData', {
                    type: 'geojson',
                    // Point to GeoJSON data. This example visualizes all M1.0+ locationData
                    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
                    data: geojsonData,
                    cluster: true,
                    clusterMaxZoom: 20, // Max zoom to cluster points on
                    clusterRadius: 20 // Radius of each cluster when clustering points (defaults to 50)
                })
                map.addLayer({
                    id: 'clusters',
                    source: 'Category',
                    type: 'circle',
                    source: 'locationData',
                    filter: ['has', 'point_count'],
                    paint: {
                        // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
                        // with three steps to implement three types of circles:
                        //   * Blue, 20px circles when point count is less than 100
                        //   * Yellow, 30px circles when point count is between 100 and 750
                        //   * Pink, 40px circles when point count is greater than or equal to 750
                        'circle-color': [
                            'step', ['get', 'point_count'],
                            '#f1f075',
                            10,
                            '#f1f075',
                            75,
                            '#f1f075',
                            
                        ],
                        'circle-radius': [
                            'step', ['get', 'point_count'],
                            20,
                            30,
                            30,
                            200,
                            40
                        ]
                    },


                });
                map.addLayer({
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'locationData',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': ['get', 'point_count_abbreviated'],
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 16
                    }
                });
                map.addLayer({
                    id: 'unclustered-point',
                    type: 'circle',
                    source: 'locationData',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                      'circle-radius': {
                        'base': 2,
                        'stops': [
                            [12, 7],
                            [22, 180]
                        ]
                    }, // size of circles
                    'circle-color': [
                        'match', ['get', 'Category'],
                        'Universitäre und außeruniversitäre Forschung', '#1f83b9',
                        'Gründerzentrum', '#61aad6',
                        'Accelerator', '#61d2ca',
                        'Technologietransferzentrum', '#61aad6',
                        'Innovationslabor', '#9dcae5',
                        'Cluster & Innovationsagentur', '#9dcae5',
                        
                        'Coworking Space', '#ff8e52',
                        'Fablab', '#ff6b6b',
                        'HackerSpace', '#ff9797',
                        'MakerSpace', '#ff7b5e',
                        '#000044'
                    ], // color of circles
                    'circle-stroke-color': 'white',
                    'circle-stroke-width': 1,
                    
                    }
                });
                map.addLayer({
                    'id': 'poi-labels',
                    'type': 'symbol',
                    'source': 'locationData',
                    'layout': {
                    'text-field': ['get', 'Location_Name'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 0.5,
                    'text-justify': 'auto',
                    'text-size': 11,
                    'text-letter-spacing': 0.05,
                    'text-offset': [0, 1.5]
                    },
                    'paint': {
                        'text-color': '#202',
                        'text-halo-color': '#fff',
                        'text-halo-width': 2
                        },
                });

            },
        );

        map.on('click', 'unclustered-point', (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['unclustered-point'],
            });
            console.log(features)
            const clickedPoint = features[0].geometry.coordinates;
            flyToLocation(clickedPoint);
            sortByDistance(clickedPoint);
            createPopup(features[0]);
        });

        map.on('mouseenter', 'unclustered-point', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'unclustered-point', () => {
            map.getCanvas().style.cursor = '';
        });
        // inspect a cluster on click
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
              layers: ['clusters']
          });
          const clusterId = features[0].properties.cluster_id;
          map.getSource('locationData').getClusterExpansionZoom(
              clusterId,
              (err, zoom) => {
                  if (err) return;

                  map.easeTo({
                      center: features[0].geometry.coordinates,
                      zoom: zoom
                  });
              }
          );
        });
        map.on('mouseenter', 'clusters', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', () => {
          map.getCanvas().style.cursor = '';
        });

        buildLocationList(geojsonData);        
      }
});



// Modal - popup for filtering results
const filterResults = document.getElementById('filterResults');
const exitButton = document.getElementById('exitButton');
const modal = document.getElementById('modal');

filterResults.addEventListener('click', () => {
    modal.classList.remove('hide-visually');
    modal.classList.add('z5');
});

exitButton.addEventListener('click', () => {
    modal.classList.add('hide-visually');
});

const title = document.getElementById('title');
title.innerText = config.title;
const description = document.getElementById('description');
description.innerText = config.description;

function transformRequest(url) {
    const isMapboxRequest =
        url.slice(8, 22) === 'api.mapbox.com' ||
        url.slice(10, 26) === 'tiles.mapbox.com';
    return {
        url: isMapboxRequest ? url.replace('?', '?pluginName=finder&') : url,
    };
}


