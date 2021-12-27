function drawViz(data) {
    // Size
    const height = dscc.getHeight();
    const width = dscc.getWidth();

    // Data
    const pointData = data.tables.DEFAULT;

    // Options
    const projectionName = data.style.projection.value;
    const map = data.style.map.value;
    const hexagonSize = data.style.hexagon_size.value;
    const backgroundColor = data.style.background_color.value.color;

    const geo = getMapGeoJson(map);
    draw(geo, pointData, width, height, projectionName, hexagonSize, backgroundColor);
}

function draw(geo, pointData, width, height, projectionName, hexagonSize, backgroundColor) {
    // Some set up.
    const pr = window.devicePixelRatio || 1;
    if (document.querySelector("canvas")) {
        let oldCanvas = document.querySelector("canvas");
        oldCanvas.parentNode.removeChild(oldCanvas);
    }

    // Crisp canvas and context.
    const canvas = d3.select("body")
      .append("canvas")
      .attr("width", width * pr)
      .attr("height", height * pr)
      .style("width", `${width}px`);
    const context = canvas.node().getContext("2d");
    context.scale(pr, pr);

    // Background color
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
    // const gradient = context.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, width / 2);
    // gradient.addColorStop(0, '#0C2648');
    // gradient.addColorStop(1, '#091426');
    // context.fillStyle = gradient;
    // context.fillRect(0, 0, width, height);

    // Projection and path.
    const projection = getProjection(projectionName).fitSize([width, height], geo);
    const geoPath = d3.geoPath()
      .projection(projection)
      .context(context);

    // // Prep user data.
    pointData.forEach(site => {
        const coords = projection([+site.lng, +site.lat]);
        site.x = coords[0];
        site.y = coords[1];
    });

    // Hexgrid generator.
    const hexgrid = d3.hexgrid()
      .extent([width, height])
      .geography(geo)
      .projection(projection)
      .pathGenerator(geoPath)
      .hexRadius(hexagonSize);

    // Hexgrid instanace.
    const hex = hexgrid(pointData);
    window.hex = hex;

    // Colour scale.
    const counts = hex.grid.layout
      .map(el => el.datapointsWt)
      .filter(el => el > 0);
    const ckBreaks = ss.ckmeans(counts, 4).map(clusters => clusters[0]);
    const colour = d3
      .scaleThreshold()
      .domain(ckBreaks)
      .range(["#293e5a", "#5e6d7c", "#929b9f", "#c7cac1", "#fbf8e3"]);

    // Draw prep.
    const hexagon = new Path2D(hex.hexagon());

    // Draw.
    hex.grid.layout.forEach(hex => {
        context.save();
        context.translate(hex.x, hex.y);
        context.fillStyle = colour(hex.datapointsWt);
        context.fill(hexagon);
        context.restore();
    });
}

/* Cannot use this code from community visualization since it uses a query.
function getMapGeoJson(map_name) {
    /**
     * Download the geojson if available.
     *
     * Retrieves the data from the GCS bucket "hexgrid-map-dev" where they are backed up.
     * These were originally available from 'https://github.com/codeforgermany/click_that_hood/blob/main/public/data/'.
     * To retrieve them, use the link like this: 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/'
     *//*
    // let url = `https://storage.googleapis.com/hexgrid-map-dev/maps/${map_name}.geojson`;
    let url = `https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/${map_name}.geojson`;
    return d3.json(url);
}
*/

function getMapGeoJson(map_name) {
    if (map_name in window.maps) {
        return window.maps[map_name];
    }
    throw `${map_name} map not included in build!`;
}

function getProjection(projectionName) {
    const availableProjections = {
        "albers": d3.geoAlbers,
        "albersUsa": d3.geoAlbersUsa,
        "mercator": d3.geoMercator
    }
    return availableProjections[projectionName]();
}

let sample = {
    tables: {
        DEFAULT: [
            {lat: 41.346439, long: -73.084938},
            {lat: 37.630322, long: -104.790543},
            {lat: 40.626743, long: -103.217026},
            {lat: 40.490429, long: -106.842384},
            {lat: 38.025131, long: -107.67588},
            {lat: 39.247478, long: -106.300194},
            {lat: 38.547871, long: -106.938622},
            {lat: 40.255306, long: -103.803062},
            {lat: 30.193626, long: -85.683029},
            {lat: 25.793449, long: -80.139198},
            {lat: 38.749077, long: -105.18306},
            {lat: 39.803318, long: -105.51683},
            {lat: 38.444931, long: -105.24572},
            {lat: 39.969753, long: -104.836723},
            {lat: 34.497196, long: -91.560921},
            {lat: 35.705608, long: -89.992729},
            {lat: 35.618671, long: -91.271286},
            {lat: 35.010712, long: -90.797783},
            {lat: 33.132671, long: -91.971634},
            {lat: 33.586617, long: -92.842979},
            {lat: 35.934574, long: -89.92617},
            {lat: 35.67897, long: -109.067413},
            {lat: 33.395844, long: -110.793739},
            {lat: 61.600803, long: -149.125259},
            {lat: 32.429066, long: -85.715233},
            {lat: 31.806484, long: -85.968628},
            {lat: 34.650826, long: -86.088501},
            {lat: 31.463181, long: -85.647202},
            {lat: 43.0186, long: -88.259773},
            {lat: 33.834263, long: -87.280708},
            {lat: 34.361664, long: -86.305595},
            {lat: 31.89818, long: -85.16021},
            {lat: 31.335653, long: -85.865448},
            {lat: 32.510178, long: -87.855392},
            {lat: 31.025837, long: -87.506462},
            {lat: 32.940945, long: -85.970024},
            {lat: 33.982506, long: -118.040962},
            {lat: 37.662937, long: -122.433014},
        ]
    },
    style: {
        projection: {value: "mercator"},
        map: {value: "united-states"},
        background_color: {
            value: {color: "aquamarine"}
        },
        hexagon_size: {value: 25},
    }
}

dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
