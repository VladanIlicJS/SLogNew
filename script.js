const csvData = [
    { address: "Depot", latitude: 44.8101292, longitude: 20.4571921, capacity: 0 },
    { address: "Homa", latitude: 44.8154655, longitude: 20.4649624, capacity: 15 },
    { address: "Lorenzo", latitude: 44.8115525, longitude: 20.4710494, capacity: 10 },
    { address: "The Pijaca", latitude: 44.7951228, longitude: 20.495698, capacity: 13 },
    { address: "Vule vu", latitude: 44.7987483, longitude: 20.4718427, capacity: 20 },
    { address: "Frans", latitude: 44.7919543, longitude: 20.4623479, capacity: 5 },
    { address: "Sheher", latitude: 44.7940164, longitude: 20.4439195, capacity: 10 },
    { address: "Milky", latitude: 44.8253265, longitude: 20.4024083, capacity: 9 },
    { address: "Umbrella", latitude: 44.8192078, longitude: 20.4080156, capacity: 7 },
    { address: "Le Petit", latitude: 44.8150608, longitude: 20.4159752, capacity: 25 },
    { address: "Kaldi", latitude: 44.8205367, longitude: 20.4176121, capacity: 15 },
    { address: "Depot", latitude: 44.8101292, longitude: 20.4571921, capacity: 0 },
  ]


  const accessToken = "pk.eyJ1IjoidmxhZGFuMDE3IiwiYSI6ImNsOW8wb210YjBjbm0zd3M1YTM0bDAwMHQifQ.GQDgnCvVxk_5xKVLHceVQA"
  const coordinates = csvData.map(coordinate => [coordinate.longitude, coordinate.latitude])
  const profile = "driving"
  mapboxgl.accessToken = accessToken
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: coordinates[0],
    zoom: 12,
  })

  const waypoints = coordinates.map(coordinate => `${coordinate[0]},${coordinate[1]}`).join(";")
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?overview=full&geometries=geojson&access_token=${accessToken}`

  const start = turf.featureCollection([turf.point(coordinates[0])])
  const end = turf.featureCollection([turf.point(coordinates[coordinates.length - 1])])
  const points=coordinates.map(coordinate=>turf.featureCollection([turf.point(coordinate)]))
  console.log(points)
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      for (const point of points) {
        new mapboxgl.Marker()
        .setLngLat(point.features[0].geometry.coordinates)
        .addTo(map)
      }
      map.addLayer({
        id: "start",
        type: "circle",
        source: {
          data: end,
          type: "geojson",
        },
        paint: {
          "circle-radius": 10,
          "circle-color": "white",
          "circle-stroke-color": "#3887be",
          "circle-stroke-width": 3,
        },
      })
      map.addLayer({
        id: "warehouse-symbol",
        type: "symbol",
        source: {
          data: start,
          type: "geojson",
        },
        layout: {
          "icon-image": "car-15",
          "icon-size": 1,
        },
        paint: {
          "text-color": "#3887be",
        },
      })
      map.addLayer(
        {
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: data.routes[0].geometry,
            },
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 22, 12],
          },
        },
        "waterway-label"
      )
      map.addLayer(
        {
          id: "routearrows",
          type: "symbol",
          source: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: data.routes[0].geometry,
            },
          },
          layout: {
            "symbol-placement": "line",
            "text-field": "▶",
            "text-size": ["interpolate", ["linear"], ["zoom"], 12, 24, 22, 60],
            "symbol-spacing": ["interpolate", ["linear"], ["zoom"], 12, 30, 22, 160],
            "text-keep-upright": false,
          },
          paint: {
            "text-color": "#3887be",
            "text-halo-color": "hsl(55, 11%, 96%)",
            "text-halo-width": 3,
          },
        },
        "waterway-label"
      )
    })
    .catch(console.error)