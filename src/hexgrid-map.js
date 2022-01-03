/**
 * Container class for all visualization-related objects.
 */
class Visualization {
    /**
     * Creates the Visualization and appends it to the DOM
     * @param {string} baseSelector selector to use to get the base element on which to append this
     */
    constructor(baseSelector) {
        this.base = d3.select(baseSelector);
        this.canvas = this.base.append("canvas");
        this.context = this.canvas.node().getContext("2d");
        this.legend = new Legend(this.base);
        this.tooltip = new Tooltip(this.base);
        this.index = new Index();
        this.selected = null;
        this.colorscale = undefined;
        this.colorize = undefined;
        this.standardize = undefined;
        this.hexagon = undefined;
        this.topMargin = undefined;
        this.bottomMargin = undefined;
        this.sideMargin = undefined;

        // Create a d3 selection on an in-memory element of type 'custom'
        this.dataContainer = d3.select(document.createElement("custom"));

        let index = this.index;
        const select = node => {this.tooltip.show(node); this.selected = node; this.draw();}
        const handler = function(e) {
            let mouseX = e.layerX;
            let mouseY = e.layerY;
            let node = index.find(mouseX, mouseY);
            select(node);
        };

        this.canvas.node().addEventListener("mousemove", handler, true);
        this.canvas.node().addEventListener("mouseleave", e => select(null), true);
    }

    /**
     * Update the styles of the Visualization.
     * @param {object} style processed by styler
     */
    style(style) {
        this.legend.style(style.legend);
        this.tooltip.style(style.tooltip);
        
        this.colorscale = this.legend.colorscale;
        this.colorize = val => val === undefined ? style.canvas.tile : this.colorscale(val);
        this.topMargin = style.canvas.css.margin.top;
        this.bottomMargin = style.canvas.css.margin.bottom;
        this.sideMargin = style.canvas.css.margin.side;
    }

    /**
     * Process the points into hexagons using d3.hexgrid.
     * @param {object} points
     * @param {object} dataConfig
     * @param {object} dimensions
     * @returns hexagon points bucketed
     */
    process(points, dataConfig, dimensions) {
        const count = (arr) => arr.length > 0 ? arr.length : undefined;
        const sum = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) : undefined;
        const avg = (arr) => arr.length > 0 ? sum(arr) / count(arr) : undefined;
        const aggregation = {"count": count, "sum": sum, "avg": avg}[dataConfig.aggregation];

        const geo = getMapGeoJson(dataConfig.map);
        const projection = getProjection(dataConfig.projection).fitSize([dimensions.width, dimensions.height], geo);
        // Projection and path.
        const geoPath = d3.geoPath()
            .projection(projection)
            .context(this.context);

        // Hexgrid generator.
        const hexgrid = d3.hexgrid()
            .extent([dimensions.width, dimensions.height])
            .geography(geo)
            .projection(projection)
            .pathGenerator(geoPath)
            .hexRadius(dataConfig.hexagonRadius);
        // Hexgrid instance.
        const hex = hexgrid(points, ["metric"]);
        // Aggregation & standardization
        hex.grid.layout.forEach(hexa => {
            hexa.radius = dataConfig.hexagonRadius;
            hexa.count = hexa.length;
            hexa.metric = aggregation(hexa.map(x => +x.metric));
            hexa.coords = projection.invert([hexa.x - hex.grid.layout[0].x, hexa.y - hex.grid.layout[0].y]);
        });
        return hex;
    }

    /**
     * Apply new dimensions.
     * @param {object} dimensions contains width, height, pixelRatio
     */
    resize(dimensions) {
        this.canvas
            .attr("width", dimensions.width * dimensions.pixelRatio)
            .attr("height", dimensions.height * dimensions.pixelRatio)
            .style("width", `${dimensions.width}px`);
        this.context.scale(dimensions.pixelRatio, dimensions.pixelRatio);
    }

    /**
     * Compute the width / height / pixelRatio.
     * @returns the computed dimensions
     */
    computeDimensions() {
        return {
            width: dscc.getWidth() - ((this.legend.display && ["left", "right"].includes(this.legend.location)) ? this.legend.verticalWidth : 0) - 2 * this.sideMargin,
            height: dscc.getHeight() - ((this.legend.display && ["top", "bottom"].includes(this.legend.location)) ? this.legend.horizontalHeight : 0) - this.topMargin - this.bottomMargin,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    /**
     * Update the data for the visualization.
     * @param {objet} points input data
     * @param {object} dataConfig config affecting the data
     */
    update(points, dataConfig) {
        const dimensions = this.computeDimensions();
        const hex = this.process(points, dataConfig, dimensions);

        // Metric coloring
        this.standardize = d3.scaleLinear()
            .domain(d3.extent(hex.grid.layout.map(hexa => hexa.metric)))
            .range([0, 1]);
        hex.grid.layout.forEach(hexa => {hexa.standardizedMetric = this.standardize(hexa.metric);});

        this.resize(dimensions);
        this.hexagon = hex.hexagon();
        this.index.update(hex.grid.layout, dataConfig.hexagonRadius);
        this.legend.update(dataConfig);
        this.tooltip.update(dataConfig);
        this.legend.updateValues(this.standardize.invert);

        // Binding
        let dataBinding = this.dataContainer.selectAll("custom.hex")
            .data(hex.grid.layout, function(d) { return d; });

        // For new elements, create a 'custom' dom node, of class hex
        // with the appropriate attributes
        dataBinding.enter()
            .append("custom")
            .classed("hex", true)
            .attr("x", hexa => hexa.x)
            .attr("y", hexa => hexa.y);

        // When updating, adjust everything
        dataBinding
            .attr("x", hexa => hexa.x)
            .attr("y", hexa => hexa.y);

        dataBinding.exit().remove();

        // Draw the map
        this.draw();
    }

    /**
     * Draw the visualization
     */
    draw() {
        // Clear background
        const width = this.canvas.attr("width");
        const height = this.canvas.attr("height");
        const hexagon = this.hexagon;
        const context = this.context;
        context.clearRect(0, 0, width, height);
        context.fill();

        // Paint hexagons
        let colorize = this.colorize;
        let elements = this.dataContainer.selectAll("custom.hex");
        elements.each(function(d) {
            let hex = d3.select(this);
            let path = new Path2D(hexagon);
            context.save();
            context.translate(hex.attr("x"), hex.attr("y"));
            context.lineWidth = 1;
            context.fillStyle = "black";
            context.stroke(path);
            context.fillStyle = colorize(d.standardizedMetric);
            context.fill(path);
            context.restore();
        });

        // Paint selected hexagon, brighter color, thicker border
        if (this.selected) {
            let path = new Path2D(hexagon);
            context.save();
            context.translate(this.selected.x, this.selected.y);
            context.lineWidth = 2;
            context.fillStyle = pSBC(0.1, colorize(this.selected.standardizedMetric));
            context.fill(path);  // Highlight
            context.stroke(path);  // Border
            context.restore();
        }
    }
}

/**
 * Class used to index hexagons by location for easy access when hovering.
 */
class Index {

    index;
    radius;

    constructor() {}

    /**
     * Reset the index to the new data.
     * @param {object} hexagons the array containing the data to index
     * @param {number} radius the size of the hexagons
     */
    update(hexagons, radius) {
        this.radius = radius;
        this.index = this.buildIndex(hexagons);
    }

    /**
     * Creates an index to search for a node from the coordinates.
     * @param {*} hexagons 
     * @returns the built index
     */
    buildIndex(hexagons) {
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

    /**
     * Finds the indexed node that is closest to the given coordinates, if any is within the radius.
     * @param {number} mouseX 
     * @param {number} mouseY 
     * @returns Possibly a node
     */
    find(mouseX, mouseY) {
        let candidates = [];
        let approximateIndexY = this.approxBinarySearch(this.index.map(el => el[0].y), mouseY);
        for (let y = approximateIndexY - 1; y <= approximateIndexY + 1 && y < this.index.length; y++) {
            if (y < 0) { continue; }
            let approximateIndexX = this.approxBinarySearch(this.index[y].map(el => el.x), mouseX);
            for (let x = approximateIndexX - 1; x <= approximateIndexX + 1 && x < this.index[y].length; x++) {
                if (x < 0) { continue; }
                candidates.push(this.index[y][x]);
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
        return closestDistance < this.radius ? closest : null;
    }

    /**
     * Perform a binary search to find the index of either the value or the next higher/lower value
     * @param {object} array numbers to search through 
     * @param {number} value key to search for
     * @returns If the value exists in the array, return its index otherwise the index of either the next higher or lower number
     */
    approxBinarySearch(array, value) {
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
}

/**
 * Class to handle style settings.
 */
class Styler {

    /**
     * Construct an instance of Styler with an initial style config.
     * @param {object} config initial style configuration
     */
    constructor(config) {
        this.config = config;
    }

    /**
     * Merge all styles and return whether the new resulting style has changes.
     * @param {object} style object coming from dscc
     * @param {object} theme object coming from dscc
     * @param {object} css object with styles defined in css
     * @returns Whether the style has been changed
     */
    update(style, theme, css) {
        let config = this.mergeStyle(style, theme, css);
        if (deepEqual(config, this.config)) {
            return false;
        }
        this.config = config;
        return true;
    }

    /**
     * Merge all styles into one object grouped by components.
     * @param {object} style object coming from dscc
     * @param {object} theme object coming from dscc
     * @param {object} css object with styles defined in css
     * @returns the merged style object
     */
    mergeStyle(style, theme, css) {
        let merge = {
            canvas: {
                tile: style.map_color.value.color || theme.themeAccentFontColor.color,
                css: {
                    margin: {
                        top: css.canvasTopMargin,
                        bottom: css.canvasBottomMargin,
                        side: css.canvasSideMargin
                    }
                }
            },
            legend: {
                location: style.legend_location.value == "none" ? null : style.legend_location.value,
                scale: {
                    name: style.colorscale.value,
                    inverted: style.inverted_colorscale.value
                },
                font: {
                    color: style.legend_font_color.value.color || theme.themeFontColor.color,
                    size: style.legend_font_size.value,
                    family: style.legend_font_family.value || theme.themeFontFamily
                },
                css: {
                    horizontalHeight: css.legendHorizontalHeight,
                    verticalWidth: css.legendVerticalWidth
                }
            },
            tooltip: {
                displayCount: style.tooltip_display_count.value,
                fill: style.tooltip_color.value.color || theme.themeAccentFillColor.color,
                font: {
                    color: style.tooltip_font_color.value.color || theme.themeAccentFontColor.color,
                    size: style.tooltip_font_size.value,
                    family: style.tooltip_font_family.value || theme.themeFontFamily
                },
                css: {
                    topOffset: css.canvasTopMargin,
                    stickLength: css.tooltipStickLength,
                    borderWidth: css.tooltipBorderWidth
                }
            }
        }
        return merge;
    }
}

/**
 * Tooltip object displayed when hovering over a hexagon.
 */
class Tooltip {

    /**
     * Constructs a new Tooltip and adds it to the DOM hidden.
     * @param {d3.select} base object on to which to build the Tooltip object 
     */
    constructor(base) {
        this.base = base;
        this.container = base.append("div")
            .attr("id", "tooltip")
            .style("display", "none");
        this.header = this.container.append("div")
            .attr("id", "tooltip-header")
        this.metricName = this.container.append("div")
            .attr("id", "tooltip-metric-name");
        this.metricValue = this.container.append("div")
            .attr("id", "tooltip-metric-value");
        this.countContainer = this.container.append("div")
            .attr("id", "tooltip-count-container");
        this.countContainer.append("hr")
        this.countName = this.countContainer.append("div")
            .attr("id", "tooltip-count-name")
            .text("Record count");
        this.countValue = this.countContainer.append("div")
            .attr("id", "tooltip-count-value");
        this.stickLength = undefined;
        this.borderWidth = undefined;
        this.topOffset = undefined;
    }

    /**
     * Update the styles of the Tooltip.
     * @param {object} style configuration built by Styler for the Tooltip
     */
    style(style) {
        // Get a darker color (or lighter if we cannot make it darker)
        let darkerFill = pSBC(0.15, pSBC(-0.3, style.fill));
        this.container
            .style("background-color", style.fill)
            .style("color", style.font.color)
            .style("font-size", `${style.font.size}px`)
            .style("font-family", style.font.family);
        this.header
            .style("background-color", darkerFill);
        this.countContainer.style("display", style.displayCount ? "block" : "none");
        this.stickLength = style.css.stickLength;
        this.borderWidth = style.css.borderWidth;
        this.topOffset = style.css.topOffset;
    }

    /**
     * Update the data config.
     * @param {object} dataConfig configuration for the Tooltip
     */
    update(dataConfig) {
        this.metricName.text(dataConfig.metric);
        this.radius = dataConfig.hexagonRadius;
    }

    /**
     * Show the tooltip for a given node.
     * @param {object} node selected node to display the tooltip on
     */
    show(node) {
        if (node === null || node.metric === undefined) {
            this.container.style("display", "none");
        } else {
            this.header.text(`lat: ${node.coords[1].toFixed(2)}, long: ${node.coords[0].toFixed(2)}`);
            this.metricValue.text((+node.metric.toFixed(2)).toLocaleString("en", {useGrouping: true}));
            this.countValue.text(node.count.toLocaleString("en", {useGrouping: true}));
            this.container
                .style("display", "block")
            let tooltipX = node.x;
            let tooltipY = node.y + this.topOffset - this.radius - this.container.node().offsetHeight - this.stickLength + this.borderWidth;
            this.container
                .style("left", `${tooltipX}px`)
                .style("top", `${tooltipY}px`);
        }
    }
}

/**
 * Legend object that can be displayed to show which values different colors correspond to.
 */
class Legend {

    /**
     * Constructs a new instance of Legend and adds it to the DOM.
     * @param {d3.select} base object on to which to build the legend object
     */
    constructor(base) {
        this.base = base;
        this.container = base.append("div")
            .attr("id", "legend")
            .attr("direction", "horizontal");
        this.title = this.container.append("div")
            .attr("id", "legend-title")
        this.values = this.container.append("div")
            .attr("id", "legend-values");
        for (let i in [...Array(11).keys()]) {
            const value = this.values.append("div")
                .attr("class", "legend-value")
                .attr("idx", i);
            value.append("span").attr("class", "legend-number");
            value.append("span").attr("class", "legend-color");
        }
        this.display = undefined;
        this.location = undefined;
        this.colorscale = undefined;
        this.horizontalHeight = undefined;
        this.verticalWidth = undefined;
    }

    /**
     * Update the styles of the Legend.
     * @param {object} style configuration built by Styler for the Legend
     * @param {string} metricName name of the metric to be displayed
     */
    style(style) {
        this.location = style.location;
        this.colorscale = getColorScale(style.scale.name, style.scale.inverted);
        this.horizontalHeight = style.css.horizontalHeight;
        this.verticalWidth = style.css.verticalWidth;
        this.display = this.location != null;
        if (this.display) {
            this.container
                .style("display", "flex")
                .style("font-family", style.font.family)
                .style("font-size", `${style.font.size}px`)
                .style("color", style.font.color);
            switch (style.location) {
                case "top":
                    this.container.attr("direction", "horizontal");
                    this.base.style("flex-direction", "column-reverse");
                    break;
                case "bottom":
                    this.container.attr("direction", "horizontal");
                    this.base.style("flex-direction", "column");
                    break;
                case "left":
                    this.container.attr("direction", "vertical");
                    this.base.style("flex-direction", "row-reverse");
                    break;
                case "right":
                    this.container.attr("direction", "vertical");
                    this.base.style("flex-direction", "row");
                    break;
            }
            let legendValues = document.getElementsByClassName("legend-value");
            for (let i = 0; i < legendValues.length; i++) {
                let idx = legendValues[i].getAttribute("idx");
                let legendColor = legendValues[i].getElementsByClassName("legend-color")[0];
                let value = idx / 10;
                legendColor.style["background-color"] = this.colorscale(value);
            }
        } else {
            this.container.style("display", "none");
        }
    }

    /**
     * Update the data config.
     * @param {object} dataConfig configuration for the Tooltip
     */
    update(dataConfig) {
        this.title.text(dataConfig.metric);
    }

    /**
     * Update the values displayed in the legend.
     * @param {d3.scale} inverseValueScale inverse of the scale that maps metric values to [0, 1]
     */
    updateValues(inverseValueScale) {
        let legendValues = document.getElementsByClassName("legend-value");
        for (let i = 0; i < legendValues.length; i++) {
            let idx = legendValues[i].getAttribute("idx");
            let value = inverseValueScale(idx / 10);
            let legendNumber = legendValues[i].getElementsByClassName("legend-number")[0];
            legendNumber.innerHTML = value.toFixed(2).toLocaleString("en", {useGrouping: true});
        };
    }
}

// Lighten / darken colors.
// Source: https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
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
    let firstTime = window.viz === undefined;
    if (firstTime) {
        window.viz = new Visualization("body");
        window.styler = new Styler();
    }

    let css = {
        canvasSideMargin: 80,
        canvasTopMargin: 60,
        canvasBottomMargin: 0,
        tooltipStickLength: 15,
        tooltipBorderWidth: 2,
        legendVerticalWidth: 200,
        legendHorizontalHeight: 80,
    }

    if (window.styler.update(data.style, data.theme, css)) {
        let style = this.styler.config;
        window.viz.style(style);
        if (!firstTime) {
            // Skip data update if not needed.
            return;
        }
    }

    // Data
    const points = data.tables.DEFAULT;
    const dataConfig = {
        projection: data.style.projection.value,
        map: data.style.map.value,
        hexagonRadius: data.style.hexagon_size.value,
        metric: data.fields.metric[0].name,
        aggregation: data.style.aggregation.value
    }

    // Data options
    window.viz.update(points, dataConfig);
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

dscc.subscribeToData(update, { transform: dscc.objectTransform });
