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
    const mapColor = data.style.map_color.value.color;
    const colorScaleName = data.style.colorscale.value;
    const invertedColorScale = data.style.inverted_colorscale.value;

    let aggregation;
    let count = (arr) => arr.length > 0 ? arr.length : undefined;
    let sum = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) : undefined;
    let avg = (arr) => arr.length > 0 ? sum(arr) / count(arr) : undefined;
    switch(data.style.aggregation.value) {
        case "sum":
            aggregation = sum;
            break;
        case "avg":
            aggregation = avg;
            break;
        default: // count
            aggregation = count;
            break;
    }
    const geo = getMapGeoJson(map);
    const colorScale = getColorScale(colorScaleName, invertedColorScale);
    const colors = {scale: colorScale, background: backgroundColor, map: mapColor};
    const dimensions = {width: width, height: height, hexagon: hexagonSize};
    draw(geo, pointData, aggregation, projectionName, dimensions, colors);
}

function draw(geo, pointData, aggregation, projectionName, dimensions, colors) {
    // Some set up.
    const pr = window.devicePixelRatio || 1;
    if (document.querySelector("canvas")) {
        let oldCanvas = document.querySelector("canvas");
        oldCanvas.parentNode.removeChild(oldCanvas);
    }

    // Crisp canvas and context.
    const canvas = d3.select("body")
      .append("canvas")
      .attr("width", dimensions.width * pr)
      .attr("height", dimensions.height * pr)
      .style("width", `${dimensions.width}px`);
    const context = canvas.node().getContext("2d");
    context.scale(pr, pr);

    // Background color
    context.fillStyle = colors.background;
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    // Projection and path.
    const projection = getProjection(projectionName).fitSize([dimensions.width, dimensions.height], geo);
    const geoPath = d3.geoPath()
      .projection(projection)
      .context(context);

    // Hexgrid generator.
    const hexgrid = d3.hexgrid()
      .extent([dimensions.width, dimensions.height])
      .geography(geo)
      .projection(projection)
      .pathGenerator(geoPath)
      .hexRadius(dimensions.hexagon);

    // Hexgrid instanace.
    const hex = hexgrid(pointData, ["metric"]);

    // Colour scale.
    const values = hex.grid.layout
      .map(arr => arr.map(x => +x.metric))
      .map(aggregation)
      .filter(x => x !== undefined);
    const maxValue = values.reduce((a, b) => Math.max(a, b), -Infinity);
    const minValue = values.reduce((a, b) => Math.min(a, b), Infinity);
    function standardize(val) {
        return val === undefined ? undefined : (val - minValue) / (maxValue - minValue);
    }
    function colorize(val) {
        let standardizedVal = standardize(val);
        let outputColor = val === undefined ? colors.map : colors.scale(standardizedVal);
        return outputColor;
    }

    // Draw prep.
    const hexagon = new Path2D(hex.hexagon());
    // Draw.
    hex.grid.layout.forEach(hex => {
        context.save();
        context.translate(hex.x, hex.y);
        context.fillStyle = colorize(aggregation(hex.map(x => +x.metric)));
        context.fill(hexagon);
        context.restore();
    });
}

function getColorScale(colorScaleName, invertedColorScale) {
    let colorScale = d3["interpolate" + colorScaleName];
    if (invertedColorScale) {
        return value => colorScale(1.0 - value)
    }
    return colorScale;
}

function getMapGeoJson(mapName) {
    if (mapName in window.maps) {
        return window.maps[mapName];
    }
    throw `${mapName} map not included in build!`;
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
            {metric: 1, lat: 41.346439, long: -73.084938},
            {metric: 1, lat: 37.630322, long: -104.790543},
            {metric: 1, lat: 40.626743, long: -103.217026},
            {metric: 1, lat: 40.490429, long: -106.842384},
            {metric: 1, lat: 38.025131, long: -107.67588},
            {metric: 1, lat: 39.247478, long: -106.300194},
            {metric: 1, lat: 38.547871, long: -106.938622},
            {metric: 1, lat: 40.255306, long: -103.803062},
            {metric: 1, lat: 30.193626, long: -85.683029},
            {metric: 1, lat: 25.793449, long: -80.139198},
            {metric: 1, lat: 38.749077, long: -105.18306},
            {metric: 1, lat: 39.803318, long: -105.51683},
            {metric: 1, lat: 38.444931, long: -105.24572},
            {metric: 1, lat: 39.969753, long: -104.836723},
            {metric: 1, lat: 34.497196, long: -91.560921},
            {metric: 1, lat: 35.705608, long: -89.992729},
            {metric: 1, lat: 35.618671, long: -91.271286},
            {metric: 1, lat: 35.010712, long: -90.797783},
            {metric: 1, lat: 33.132671, long: -91.971634},
            {metric: 1, lat: 33.586617, long: -92.842979},
            {metric: 1, lat: 35.934574, long: -89.92617},
            {metric: 1, lat: 35.67897, long: -109.067413},
            {metric: 1, lat: 33.395844, long: -110.793739},
            {metric: 1, lat: 61.600803, long: -149.125259},
            {metric: 1, lat: 32.429066, long: -85.715233},
            {metric: 1, lat: 31.806484, long: -85.968628},
            {metric: 1, lat: 34.650826, long: -86.088501},
            {metric: 1, lat: 31.463181, long: -85.647202},
            {metric: 1, lat: 43.0186, long: -88.259773},
            {metric: 1, lat: 33.834263, long: -87.280708},
            {metric: 1, lat: 34.361664, long: -86.305595},
            {metric: 1, lat: 31.89818, long: -85.16021},
            {metric: 1, lat: 31.335653, long: -85.865448},
            {metric: 1, lat: 32.510178, long: -87.855392},
            {metric: 1, lat: 31.025837, long: -87.506462},
            {metric: 1, lat: 32.940945, long: -85.970024},
            {metric: 1, lat: 33.982506, long: -118.040962},
            {metric: 1, lat: 37.662937, long: -122.433014},
        ]
    },
    style: {
        projection: {value: "mercator"},
        map: {value: "united-states"},
        background_color: {
            value: {color: "aquamarine"}
        },
        map_color: {
            value: {color: "gray"}
        },
        hexagon_size: {value: 25},
        aggregation: {value: "sum"},
        colorscale: {value: "YlOrBr"},
        inverted_colorscale: {value: false}
    }
}

dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
