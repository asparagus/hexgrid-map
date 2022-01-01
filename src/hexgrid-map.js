function binarySearch(array, value) {
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

    base;
    canvas;
    context;
    dataContainer;
    tooltip;
    tooltipHeader;
    legend;
    index;
    selected;
    selectedX;
    selectedY;
    selectedColor;

    constructor(baseSelector) {
        this.base = d3.select(baseSelector);
        this.setup();
    }

    setup() {
        const canvas = this.base.append("canvas");
        const context = canvas.node().getContext("2d");
        const ttip = buildTooltip(this.base);
        const lgnd = buildLegend(this.base);
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
        this.tooltipHeader = ttip.selectChildren("#tooltip-header");
        this.legend = lgnd;
        this.index = index;
        this.selected = false;

        const handler = function(e) {
            let mouseX = e.layerX;
            let mouseY = e.layerY;
            let node = select(mouseX, mouseY);
            tooltip(node);
        };
        canvas.node().addEventListener("mousemove", handler, true);
        canvas.node().addEventListener("mouseleave", e => tooltip(undefined), true);
    }
}

function select(mouseX, mouseY) {
    const radius = Number(viz.canvas.attr("hexagon-radius"));
    let candidates = [];
    let approximateIndexY = binarySearch(viz.index.map(el => el[0].y), mouseY);
    for (let y = approximateIndexY - 1; y <= approximateIndexY + 1 && y < viz.index.length; y++) {
        if (y < 0) { continue; }
        let approximateIndexX = binarySearch(viz.index[y].map(el => el.x), mouseX);
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
    return closestDistance < radius ? closest : undefined;
}

function buildLegend(base) {
    let lgnd = base.append("div")
        .attr("id", "legend")
        .attr("direction", "horizontal");
    lgnd.append("div")
        .attr("id", "legend-title")
    let lgndValues = lgnd.append("div")
        .attr("id", "legend-values");
    for (let i in [...Array(11).keys()]) {
        const value = lgndValues.append("div")
            .attr("class", "legend-value");
        value.append("span")
            .attr("class", "legend-number")
            .attr("idx", i);
        value.append("span")
            .attr("class", "legend-color");
    }
    return lgnd;
}

function legend(metricName, valueScale, colorScale) {
    d3.select("#legend-title").text(metricName);
    let legendValues = document.getElementsByClassName("legend-value");
    for (let i = 0; i < legendValues.length; i++) {
        let legendNumber = legendValues[i].getElementsByClassName("legend-number")[0];
        let legendColor = legendValues[i].getElementsByClassName("legend-color")[0];
        let idx = legendNumber.getAttribute("idx");
        let value = valueScale.invert(idx / 10);
        legendNumber.innerHTML = value.toFixed(2).toLocaleString("en", {useGrouping: true});
        legendColor.style["background-color"] = colorScale(value);
    };
}

function buildTooltip(base) {
    let container = base.append("div")
        .attr("id", "tooltip")
        .style("display", "none");
    container.append("div")
        .attr("id", "tooltip-header")
    container.append("div")
        .attr("id", "tooltip-metric-name");
    container.append("div")
        .attr("id", "tooltip-metric-value");
    let countContainer = container.append("div")
        .attr("id", "tooltip-count-container");
    countContainer.append("hr")
    countContainer.append("div")
        .attr("id", "tooltip-count-name")
        .text("Record count");
    countContainer.append("div")
        .attr("id", "tooltip-count-value");
    return container;
}

cssDimensions = {
    canvasSideMargin: 80,
    canvasTopMargin: 60,
    canvasBottomMargin: 0,
    tooltipStickLength: 15,
    tooltipBorderWidth: 2,
    legendVerticalWidth: 200,
    legendHorizontalHeight: 80,
}

styles = {}
themes = {}

function tooltip(node) {
    const radius = Number(viz.canvas.attr("hexagon-radius"));
    let ttip = d3.select("#tooltip");
    if (node === undefined || node.metric === undefined) {
        d3.select("#tooltip").style("display", "none");
        window.viz.selected = false;
    } else {
        let metricName = ttip.attr("metric") || "Metric";
        let showCount = Number(ttip.attr("count"));
        let height = window.viz.canvas.attr("height") / (window.devicePixelRatio || 1);
        let tooltipX = node.x;
        let tooltipY = height - node.y + radius + window.cssDimensions.tooltipStickLength - window.cssDimensions.tooltipBorderWidth;
        ttip
            .style("display", "block")
            .style("left", `${tooltipX}px`)
            .style("bottom", `${tooltipY}px`);
        d3.select("#tooltip-header")
            .text(`lat: ${node.coords[1].toFixed(2)}, long: ${node.coords[0].toFixed(2)}`);
        d3.select("#tooltip-metric-name")
            .text(metricName);
        d3.select("#tooltip-metric-value")
            .text((+node.metric.toFixed(2)).toLocaleString("en", {useGrouping: true}));
        if (showCount) {
            d3.select("#tooltip-count-container")
                .style("display", "block");
            d3.select("#tooltip-count-value")
                .text(node.count.toLocaleString("en", {useGrouping: true}));
        } else {
            d3.select("#tooltip-count-container")
                .style("display", "none");
        }
        window.viz.selected = true;
        window.viz.selectedX = node.x;
        window.viz.selectedY = node.y;
        window.viz.selectedColor = node.color;
    }
}

const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        } else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        } return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

function deepEqual(x, y) {
    if (typeof(x) === "object") {
        if (typeof(y) === "object") {
            for (let prop in x) {
                if (!deepEqual(x[prop], y[prop])) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    return x === y;
}

function update(data) {
    if (window.viz === undefined) {
        window.viz = new Visualization("body");
    }

    // Options
    const style = data.style;
    const theme = data.theme;
    const projectionName = style.projection.value;
    const map = style.map.value;
    const hexagonSize = style.hexagon_size.value;
    const backgroundColor = style.background_color.value.color || theme.themeFillColor.color;
    const mapColor = style.map_color.value.color || theme.themeAccentFontColor.color;
    const colorScaleName = style.colorscale.value;
    const invertedColorScale = style.inverted_colorscale.value;
    const metricName = data.fields.metric[0].name;
    const metricAggregationName = style.aggregation.value;
    const tooltipFillColor = style.tooltip_color.value.color || theme.themeAccentFillColor.color;
    const tooltipFontColor = style.tooltip_font_color.value.color || theme.themeAccentFontColor.color;
    const tooltipFontSize = style.tooltip_font_size.value;
    const tooltipFontFamily = style.tooltip_font_family.value || theme.themeFontFamily;
    const tooltipDisplayCount = style.tooltip_display_count.value;
    const legendLocation = style.legend_location.value;
    const legendFontSize = style.legend_font_size.value;
    const legendFontColor = style.legend_font_color.value.color || theme.themeFontColor.color;
    const legendFontFamily = style.legend_font_family.value || theme.themeFontFamily;
    const legendDisplay = style.legend_display.value;

    if (deepEqual(style, window.styles)) {
        console.log("Style kept");
    } else {
        console.log("Style changed");
        console.log(style)
        window.styles = style;
    }
    if (deepEqual(theme, window.themes)) {
        console.log("Theme kept");
    } else {
        console.log("Theme changed");
        window.themes = theme;
    }

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
        width: dscc.getWidth() - (legendDisplay && ["left", "right"].includes(legendLocation) ? window.cssDimensions.legendVerticalWidth : 0) - 2 * window.cssDimensions.canvasSideMargin,
        height: dscc.getHeight() - (legendDisplay && ["top", "bottom"].includes(legendLocation) ? window.cssDimensions.legendHorizontalHeight : 0) - window.cssDimensions.canvasTopMargin - window.cssDimensions.canvasBottomMargin,
        hexagonRadius: hexagonSize,
        pixelRatio: window.devicePixelRatio || 1
    };
    const geo = getMapGeoJson(map);
    const projection = getProjection(projectionName).fitSize([dimensions.width, dimensions.height], geo);

    window.viz.canvas
        .attr("aggregation", metricAggregationName)
        .attr("hexagon-radius", dimensions.hexagonRadius)
        .attr("width", dimensions.width * dimensions.pixelRatio)
        .attr("height", dimensions.height * dimensions.pixelRatio)
        .style("width", `${dimensions.width}px`)
        .attr("background-color", colors.background);
    window.viz.context.scale(dimensions.pixelRatio, dimensions.pixelRatio);
    window.viz.tooltip
        .attr("metric", metricName)
        .attr("count", Number(tooltipDisplayCount))
        .style("font-size", `${tooltipFontSize}px`)
        .style("color", tooltipFontColor)
        .style("background-color", tooltipFillColor)
        .style("font-family", tooltipFontFamily);
    window.viz.tooltipHeader
        .style("background-color", pSBC(0.15, pSBC(-0.3, tooltipFillColor)));
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
    window.hexagon = hexagon;
    // Aggregation & standardization
    hex.grid.layout.forEach(hexa => {
        hexa.radius = dimensions.hexagonRadius;
        hexa.count = hexa.length;
        hexa.metric = aggregation(hexa.map(x => +x.metric));
        hexa.coords = projection.invert([hexa.x - hex.grid.layout[0].x, hexa.y - hex.grid.layout[0].y]);
    });
    // Indexing
    window.viz.index = buildIndex(hex.grid.layout);

    // Metric coloring
    const aggregatedValues = hex.grid.layout.map(hexa => hexa.metric);
    const standardize = d3.scaleLinear()
        .domain(d3.extent(aggregatedValues))
        .range([0, 1]);

    // Coloring
    const colorize = val => val === undefined ? colors.map : colors.scale(standardize(val));
    hex.grid.layout.forEach(hexa => {
        hexa.color = colorize(hexa.metric);
    });

    // Set up legend
    if (legendDisplay) {
        let lgnd = d3.select("#legend")
            .style("font-family", legendFontFamily)
            .style("font-size", `${legendFontSize}px`)
            .style("color", legendFontColor);
        switch (legendLocation) {
            case "top":
                  lgnd.attr("direction", "horizontal");
                  window.viz.base.style("flex-direction", "column-reverse");
                  break;
            case "bottom":
                lgnd.attr("direction", "horizontal");
                window.viz.base.style("flex-direction", "column");
                break;
            case "left":
                lgnd.attr("direction", "vertical");
                window.viz.base.style("flex-direction", "row-reverse");
                break;
            case "right":
                lgnd.attr("direction", "vertical");
                window.viz.base.style("flex-direction", "row");
                break;
        }
        legend(metricName, standardize, colorize);
    } else {
        d3.select("#legend").style("display", "none");
    }

    let dataBinding = window.viz.dataContainer.selectAll("custom.hex")
        .data(hex.grid.layout, function(d) { return d; });

    // For new elements, create a 'custom' dom node, of class hex
    // with the appropriate attributes
    dataBinding.enter()
        .append("custom")
        .classed("hex", true)
        .attr("x", hex => hex.x)
        .attr("y", hex => hex.y)
        .attr("color", hex => hex.color)
        .attr("hexagon", hexagon);

    // When updating, adjust everything
    dataBinding
        .attr("x", hex => hex.x)
        .attr("y", hex => hex.y)
        .attr("color", hex => hex.color)
        .attr("hexagon", hexagon);

    dataBinding.exit().remove();
}

function buildIndex(hexagons) {
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
    const width = window.viz.canvas.attr("width");
    const height = window.viz.canvas.attr("height");
    const backgroundColor = window.viz.canvas.attr("background-color");
    window.viz.base.style("background-color", backgroundColor);
    window.viz.context.fillStyle = backgroundColor;
    window.viz.context.fillRect(0, 0, width, height);
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

    if (window.viz.selected) {
        let path = new Path2D(window.hexagon);
        window.viz.context.save();
        window.viz.context.translate(window.viz.selectedX, window.viz.selectedY);
        window.viz.context.lineWidth = 2;
        window.viz.context.fillStyle = pSBC(0.1, window.viz.selectedColor);
        window.viz.context.fill(path)
        window.viz.context.stroke(path);
        window.viz.context.restore();
    }
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

d3.timer(draw);
dscc.subscribeToData(update, { transform: dscc.objectTransform });
