function approxBinarySearch(array, value) {
    let proxyIndexUpperBound = array.length;
    let proxyIndexLowerBound = 0;
    let proxyIndex, currentValue;
    while (proxyIndexUpperBound > proxyIndexLowerBound) {
        proxyIndex = Math.floor((proxyIndexLowerBound + proxyIndexUpperBound) / 2);
        currentValue = array[proxyIndex];
        if (currentValue < value) {
            proxyIndexLowerBound = proxyIndex + 1;
        } else if (currentValue > value) {
            proxyIndexUpperBound = proxyIndex;
        } else {
            proxyIndexUpperBound = proxyIndex;
            proxyIndexLowerBound = proxyIndex;
        }
    }
    return proxyIndex;
}


class Visualization {

    canvas;
    context;
    dataContainer;
    tooltip;
    index;

    constructor(baseSelector) {
        this.baseSelector = baseSelector;
        this.setup();
    }

    setup() {
        const base = d3.select(this.baseSelector);
        const ttip = buildTooltip(base);
        const canvas = base.append("canvas");
        const context = canvas.node().getContext("2d");
        let index = [];

        // Create an in memory only element of type 'custom'
        const detachedContainer = document.createElement("custom");

        // Create a d3 selection for the detached container. We won't
        // actually be attaching it to the DOM.
        const dataContainer = d3.select(detachedContainer);
        this.canvas = canvas;
        this.context = context;
        this.dataContainer = dataContainer;
        this.tooltip = ttip;
        this.index = index;

        const handler = function(e) {
            let mouseX = e.layerX;
            let mouseY = e.layerY;
            let node = select(mouseX, mouseY);
            tooltip(mouseX, mouseY + 15, node);
        };
        canvas.node().addEventListener("mousemove", handler, true);
        canvas.node().addEventListener("mouseleave", e => tooltip(null, null, undefined), true);
    }
}

function select(mouseX, mouseY) {
    let candidates = [];
    let approximateIndexY = approxBinarySearch(viz.index.map(el => el[0].y), mouseY);
    for (let y = approximateIndexY - 1; y <= approximateIndexY + 1 && y < viz.index.length; y++) {
        if (y < 0) { continue; }
        let approximateIndexX = approxBinarySearch(viz.index[y].map(el => el.x), mouseX);
        for (let x = approximateIndexX - 1; x <= approximateIndexX + 1 && x < viz.index[y].length; x++) {
            if (x < 0) { continue; }
            candidates.push(viz.index[y][x]);
        }
    }
    let closest = null;
    let closestDistance = null;
    candidates.forEach(function(d) {
        let dx = (mouseX - d.x);
        let dy = (mouseY - d.y);
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (closest === null || dist < closestDistance) {
            closest = d;
            closestDistance = dist;
        }
    });
    return closestDistance < closest.radius ? closest : undefined;
}

function buildTooltip(base) {
    let container = base.append("div")
      .attr("id", "tooltip")
      .style("display", "none");
    container.append("div")
      .attr("id", "tooltip-metric-name");
    container.append("div")
      .attr("id", "tooltip-metric-value");
    let countContainer = container.append("div")
      .attr("id", "tooltip-count-container");
    countContainer.append("hr")
    countContainer.append("div")
      .attr("id", "tooltip-count-name")
      .text("Record count:");
    countContainer.append("div")
      .attr("id", "tooltip-count-value");
    return container;
}

function tooltip(x, y, node) {
    let ttip = d3.select("#tooltip");
    if (node === undefined || node.metric === undefined) {
        d3.select("#tooltip").style("display", "none");
    } else {
        let metricName = ttip.attr("metric") || "Metric";
        let showCount = Number(ttip.attr("count"));
        let height = window.viz.canvas.attr("height") / 2;
        let tooltipX = x - 60;
        let tooltipY = height - y + 30;
        ttip
          .style("display", "block")
          .style("left", `${tooltipX}px`)
          .style("bottom", `${tooltipY}px`);
        d3.select("#tooltip-metric-name")
          .text(metricName);
        d3.select("#tooltip-metric-value")
          .text((+node.metric.toFixed(2)).toLocaleString('en', {useGrouping: true}));
        if (showCount) {
            d3.select("#tooltip-count-container")
              .style("display", "block");
            d3.select("#tooltip-count-value")
              .text(node.count.toLocaleString('en', {useGrouping: true}));
        } else {
            d3.select("#tooltip-count-container")
              .style("display", "none");
        }
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
    const metricName = data.fields.metric[0].name;
    const metricAggregationName = data.style.aggregation.value;
    const tooltipFillColor = data.style.tooltip_fill_color.value.color;
    const tooltipFontColor = data.style.tooltip_font_color.value.color;
    const tooltipFontSize = data.style.tooltip_font_size.value;
    const tooltipFontFamily = data.style.tooltip_font_family.value;
    const tooltipDisplayCount = data.style.tooltip_display_count.value;

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

    window.viz.canvas
      .attr("aggregation", metricAggregationName)
      .attr("width", dimensions.width * dimensions.pixelRatio)
      .attr("height", dimensions.height * dimensions.pixelRatio)
      .style("width", `${dimensions.width}px`)
      .attr("background-color", colors.background);
    window.viz.context.scale(dimensions.pixelRatio, dimensions.pixelRatio);
    window.viz.tooltip
      .attr("metric", metricName)
      .attr("count", Number(tooltipDisplayCount))
      .style("color", tooltipFontColor)
      .style("background-color", tooltipFillColor)
      .style("font-size", `${tooltipFontSize}px`)
      .style("font-family", tooltipFontFamily);

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

    // Hexgrid instance.
    const hex = hexgrid(pointData, ["metric"]);
    const hexagon = hex.hexagon();
    // Aggregation & standardization
    hex.grid.layout.forEach(arr => {
        arr.radius = dimensions.hexagonRadius;
        arr.count = arr.length;
        arr.metric = aggregation(arr.map(x => +x.metric));
    });
    // Indexing
    window.viz.index = buildIndex(hex.grid.layout);

    // Metric coloring
    const aggregatedValues = hex.grid.layout.map(arr => arr.metric);
    const standardize = d3.scaleLinear()
      .domain(d3.extent(aggregatedValues))
      .range([0, 1]);

    // Coloring
    const colorize = val => val === undefined ? colors.map : colors.scale(standardize(val));

    let dataBinding = window.viz.dataContainer.selectAll("custom.hex")
      .data(hex.grid.layout, function(d) { return d; });

    // For new elements, create a 'custom' dom node, of class hex
    // with the appropriate attributes
    dataBinding.enter()
      .append("custom")
      .classed("hex", true)
      .attr("x", hex => hex.x)
      .attr("y", hex => hex.y)
      .attr("color", hex => colorize(hex.metric))
      .attr("hexagon", hexagon);

    // When updating, adjust everything
    dataBinding
      .attr("x", hex => hex.x)
      .attr("y", hex => hex.y)
      .attr("color", hex => colorize(hex.metric))
      .attr("hexagon", hexagon);

    dataBinding.exit().remove();
}

function buildIndex(hexagons) {
    window.hex = hexagons;
    let indexByY = {};
    hexagons.forEach(hex => {
        if (!(hex.y  in indexByY)) {
            indexByY[hex.y] = [];
        }
        indexByY[hex.y].push(hex);
    });
    const compareFn = fn => ((a, b) => fn(a) - fn(b));
    Object.keys(indexByY).forEach(y => {
        indexByY[y] = indexByY[y].filter(el => el.metric !== undefined).sort(compareFn(el => el.x));
    })
    let index = Object.values(indexByY);
    index = index.filter(el => el.length > 0).sort(compareFn(el => el[0].y));
    return index;
}

function draw() {
    if (window.viz === undefined) {
        return;
    }
    // Repaint background
    const pr = window.devicePixelRatio || 1;
    const backgroundColor = window.viz.canvas.attr("background-color");
    window.viz.context.fillStyle = backgroundColor;
    window.viz.context.fillRect(0, 0, dscc.getWidth() * pr, dscc.getHeight() * pr);
    window.viz.context.fill();

    // Paint hexagons
    let elements = window.viz.dataContainer.selectAll("custom.hex");
    elements.each(function(d) {
        let hex = d3.select(this);
        window.viz.context.save();
        window.viz.context.translate(hex.attr("x"), hex.attr("y"));
        window.viz.context.fillStyle = hex.attr("color");
        window.viz.context.fill(new Path2D(hex.attr("hexagon")));
        window.viz.context.restore();
    });
}

function getColorScale(colorScaleName, invertedColorScale) {
    let colorScale = d3[`interpolate${colorScaleName}`];
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
    fields: {
        metric: [{name: "l2_3s"}]
    },
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
        inverted_colorscale: {value: false},
        tooltip_font_color: {
            value: {color: "black"}
        },
        tooltip_font_size: {value: 14},
        tooltip_font_family: {value: "Helvetica, Verdana, sans-serif"},
        tooltip_fill_color: {
            value: {color: "#dcdcdc"}
        },
        tooltip_display_count: {value: false}
    }
}

d3.timer(draw);
dscc.subscribeToData(update, { transform: dscc.objectTransform });
