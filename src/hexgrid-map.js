class Visualization {

    chart;
    context;
    dataContainer;

    constructor(baseSelector) {
        this.baseSelector = baseSelector;
        this.setup();
    }

    setup() {
        const base = d3.select(this.baseSelector);

        const chart = base.append("canvas");
        const context = chart.node().getContext("2d");

        // Create an in memory only element of type 'custom'
        const detachedContainer = document.createElement("custom");

        // Create a d3 selection for the detached container. We won't
        // actually be attaching it to the DOM.
        const dataContainer = d3.select(detachedContainer);
        this.chart = chart;
        this.context = context;
        this.dataContainer = dataContainer;
    }
}

function update(data) {
    if (window.viz === undefined) {
        window.viz = new Visualization("body");
    }

    // Options
    const projectionName = data.style.projection.value;
    const map = data.style.map.value;
    const hexagonSize = data.style.hexagon_size.value;
    const backgroundColor = data.style.background_color.value.color;
    const mapColor = data.style.map_color.value.color;
    const colorScaleName = data.style.colorscale.value;
    const invertedColorScale = data.style.inverted_colorscale.value;
    const metricAggregationName = data.style.aggregation.value;

    const colorScale = getColorScale(colorScaleName, invertedColorScale);
    const colors = {
        scale: colorScale,
        background: backgroundColor,
        map: mapColor
    };
    const count = (arr) => arr.length > 0 ? arr.length : undefined;
    const sum = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) : undefined;
    const avg = (arr) => arr.length > 0 ? sum(arr) / count(arr) : undefined;
    const aggregation = {"count": count, "sum": sum, "avg": avg}[metricAggregationName];
    const dimensions = {
        width: dscc.getWidth(),
        height: dscc.getHeight(),
        hexagonRadius: hexagonSize,
        pixelRatio: window.devicePixelRatio || 1
    };
    const geo = getMapGeoJson(map);
    const projection = getProjection(projectionName).fitSize([dimensions.width, dimensions.height], geo);

    // Crisp canvas and context.
    window.viz.chart
      .attr("width", dimensions.width * dimensions.pixelRatio)
      .attr("height", dimensions.height * dimensions.pixelRatio)
      .style("width", `${dimensions.width}px`);
    window.viz.context.scale(dimensions.pixelRatio, dimensions.pixelRatio);
    window.viz.context.fillStyle = colors.background;

    // Data
    const pointData = data.tables.DEFAULT;

    // Projection and path.
    const geoPath = d3.geoPath()
      .projection(projection)
      .context(window.viz.context);

    // Hexgrid generator.
    const hexgrid = d3.hexgrid()
      .extent([dimensions.width, dimensions.height])
      .geography(geo)
      .projection(projection)
      .pathGenerator(geoPath)
      .hexRadius(dimensions.hexagonRadius);

    // Hexgrid instanace.
    const hex = hexgrid(pointData, ["metric"]);
    const hexagon = hex.hexagon();

    // Metric coloring
    const aggregatedValues = hex.grid.layout
      .map(arr => arr.map(x => +x.metric))
      .map(aggregation);
    const standardize = d3.scaleLinear()
      .domain(d3.extent(aggregatedValues))
      .range([0, 1]);
    const colorize = val => val === undefined ? colors.map : colors.scale(standardize(val));

    var dataBinding = window.viz.dataContainer.selectAll("custom.hex")
      .data(hex.grid.layout, function(d) { return d; });

    // for new elements, create a 'custom' dom node, of class hex
    // with the appropriate rect attributes
    dataBinding.enter()
      .append("custom")
      .classed("hex", true)
      .attr("x", hex => hex.x)
      .attr("y", hex => hex.y)
      .attr("color", hex => colorize(aggregation(hex.map(x => +x.metric))))
      .attr("hexagon", hexagon)
      .attr("size", dimensions.hexagonRadius);
}

function draw() {
    if (window.viz === undefined) {
        return;
    }
    // Repaint background
    window.viz.context.fillRect(0, 0, dscc.getWidth(), dscc.getHeight());
    window.viz.context.fill();

    // Paint hexagons
    var elements = window.viz.dataContainer.selectAll("custom.hex");
    elements.each(function(d) {
        var hex = d3.select(this);
        window.viz.context.save();
        window.viz.context.translate(hex.attr("x"), hex.attr("y"));
        window.viz.context.fillStyle = hex.attr("color");
        window.viz.context.fill(new Path2D(hex.attr("hexagon")));
        window.viz.context.restore();
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

d3.timer(draw);
dscc.subscribeToData(update, { transform: dscc.objectTransform });
