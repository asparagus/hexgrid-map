// 37.7749° N, 122.4194° W
// 37.75 - 37.80
// 122.40 - 122.45

let pointData = [
    {lat: 37.77, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.76, lng: -122.40},
    {lat: 37.78, lng: -122.41},
    {lat: 37.75, lng: -122.42},
    {lat: 37.77, lng: -122.41},
    {lat: 37.75, lng: -122.42},
    {lat: 37.78, lng: -122.41},
    {lat: 37.76, lng: -122.44},
    {lat: 37.77, lng: -122.40},
    {lat: 37.80, lng: -122.41},
    {lat: 37.79, lng: -122.41},
    {lat: 37.78, lng: -122.41},
    {lat: 37.76, lng: -122.41},
    {lat: 37.77, lng: -122.41},
    {lat: 37.78, lng: -122.40},
    {lat: 37.76, lng: -122.42},
    {lat: 37.77, lng: -122.45},
    {lat: 37.79, lng: -122.45},
    {lat: 37.77, lng: -122.41},
    {lat: 37.79, lng: -122.41},
    {lat: 37.76, lng: -122.40},
    {lat: 37.79, lng: -122.41},
    {lat: 37.80, lng: -122.41},
    {lat: 37.77, lng: -122.43},
    {lat: 37.76, lng: -122.44},
    {lat: 37.80, lng: -122.41},
    {lat: 37.80, lng: -122.40},
    {lat: 37.79, lng: -122.42},
    {lat: 37.75, lng: -122.45},
    {lat: 37.78, lng: -122.40},
    {lat: 37.77, lng: -122.41},
    {lat: 37.78, lng: -122.45},
    {lat: 37.76, lng: -122.42},
    {lat: 37.79, lng: -122.41},
    {lat: 37.79, lng: -122.42},
    {lat: 37.78, lng: -122.41},
    {lat: 37.76, lng: -122.44},
    {lat: 37.77, lng: -122.41},
    {lat: 37.76, lng: -122.42},
    {lat: 37.79, lng: -122.45},
    {lat: 37.76, lng: -122.40},
    {lat: 37.78, lng: -122.41},
    {lat: 37.76, lng: -122.42},
    {lat: 37.79, lng: -122.45},
    {lat: 37.79, lng: -122.45},
    {lat: 37.78, lng: -122.41},
    {lat: 37.80, lng: -122.42},
    {lat: 37.76, lng: -122.42},
    {lat: 37.75, lng: -122.42},
    {lat: 37.75, lng: -122.43},
    {lat: 37.76, lng: -122.45},
    {lat: 37.76, lng: -122.45},
    {lat: 37.80, lng: -122.41},
    {lat: 37.79, lng: -122.42},
    {lat: 37.78, lng: -122.40},
    {lat: 37.76, lng: -122.41},
    {lat: 37.79, lng: -122.42},
    {lat: 37.77, lng: -122.41},
    {lat: 37.78, lng: -122.41},
    {lat: 37.76, lng: -122.43},
    {lat: 37.79, lng: -122.44},
    {lat: 37.79, lng: -122.44},
    {lat: 37.77, lng: -122.41},
    {lat: 37.76, lng: -122.44},
    {lat: 37.77, lng: -122.40},
    {lat: 37.75, lng: -122.43},
    {lat: 37.80, lng: -122.42},
    {lat: 37.76, lng: -122.41},
    {lat: 37.76, lng: -122.43},
    {lat: 37.76, lng: -122.41},
    {lat: 37.79, lng: -122.43},
    {lat: 37.77, lng: -122.42},
    {lat: 37.79, lng: -122.45},
    {lat: 37.77, lng: -122.42},
    {lat: 37.77, lng: -122.42},
    {lat: 37.79, lng: -122.43},
    {lat: 37.76, lng: -122.42},
    {lat: 37.76, lng: -122.44},
    {lat: 37.79, lng: -122.42},
    {lat: 37.76, lng: -122.42},
    {lat: 37.79, lng: -122.45},
    {lat: 37.78, lng: -122.44},
    {lat: 37.77, lng: -122.41},
    {lat: 37.77, lng: -122.43},
    {lat: 37.79, lng: -122.41},
    {lat: 37.75, lng: -122.44},
    {lat: 37.77, lng: -122.41},
    {lat: 37.77, lng: -122.44},
    {lat: 37.76, lng: -122.41},
    {lat: 37.75, lng: -122.41},
    {lat: 37.77, lng: -122.45},
    {lat: 37.79, lng: -122.44},
    {lat: 37.77, lng: -122.43},
    {lat: 37.78, lng: -122.43},
    {lat: 37.78, lng: -122.43},
    {lat: 37.79, lng: -122.42},
    {lat: 37.77, lng: -122.45},
    {lat: 37.76, lng: -122.42},
    {lat: 37.77, lng: -122.40},
    {lat: 37.76, lng: -122.42},
    {lat: 37.77, lng: -122.42},
    {lat: 37.76, lng: -122.44},
    {lat: 37.78, lng: -122.44},
    {lat: 37.75, lng: -122.43},
    {lat: 37.76, lng: -122.42},
    {lat: 37.79, lng: -122.41},
    {lat: 37.77, lng: -122.44},
    {lat: 37.76, lng: -122.45},
    {lat: 37.79, lng: -122.41},
    {lat: 37.78, lng: -122.44},
    {lat: 37.77, lng: -122.41},
    {lat: 37.76, lng: -122.42},
    {lat: 37.76, lng: -122.42},
    {lat: 37.80, lng: -122.41},
    {lat: 37.76, lng: -122.44},
    {lat: 37.77, lng: -122.42},
    {lat: 37.78, lng: -122.44},
    {lat: 37.76, lng: -122.40},
    {lat: 37.78, lng: -122.42},
    {lat: 37.79, lng: -122.41},
    {lat: 37.76, lng: -122.43},
    {lat: 37.76, lng: -122.45},
    {lat: 37.75, lng: -122.42},
    {lat: 37.80, lng: -122.42},
    {lat: 37.78, lng: -122.43},
    {lat: 37.77, lng: -122.43},
    {lat: 37.79, lng: -122.43},
    {lat: 37.79, lng: -122.40},
    {lat: 37.79, lng: -122.41},
    {lat: 37.80, lng: -122.44},
    {lat: 37.78, lng: -122.42},
    {lat: 37.77, lng: -122.44},
    {lat: 37.76, lng: -122.41},
    {lat: 37.79, lng: -122.41},
    {lat: 37.78, lng: -122.41},
    {lat: 37.79, lng: -122.45},
    {lat: 37.80, lng: -122.42},
    {lat: 37.80, lng: -122.44},
    {lat: 37.76, lng: -122.41},
    {lat: 37.77, lng: -122.41},
    {lat: 37.76, lng: -122.42},
    {lat: 37.78, lng: -122.43},
    {lat: 37.77, lng: -122.44},
    {lat: 37.77, lng: -122.45},
    {lat: 37.79, lng: -122.43},
    {lat: 37.78, lng: -122.40},
    {lat: 37.80, lng: -122.43},
    {lat: 37.76, lng: -122.44},
    {lat: 37.80, lng: -122.44},
    {lat: 37.77, lng: -122.44},
    {lat: 37.78, lng: -122.44},
    {lat: 37.78, lng: -122.41},
    {lat: 37.79, lng: -122.43},
    {lat: 37.78, lng: -122.40},
    {lat: 37.79, lng: -122.41},
    {lat: 37.75, lng: -122.40},
    {lat: 37.78, lng: -122.43},
    {lat: 37.79, lng: -122.41},
    {lat: 37.75, lng: -122.41},
    {lat: 37.77, lng: -122.44},
    {lat: 37.78, lng: -122.42},
    {lat: 37.76, lng: -122.44},
    {lat: 37.76, lng: -122.43},
    {lat: 37.76, lng: -122.41},
    {lat: 37.80, lng: -122.40},
    {lat: 37.77, lng: -122.44},
    {lat: 37.79, lng: -122.44},
    {lat: 37.77, lng: -122.43},
    {lat: 37.76, lng: -122.45},
    {lat: 37.76, lng: -122.41},
    {lat: 37.77, lng: -122.42},
    {lat: 37.78, lng: -122.41},
    {lat: 37.75, lng: -122.41},
    {lat: 37.79, lng: -122.43},
    {lat: 37.76, lng: -122.43},
    {lat: 37.76, lng: -122.42},
    {lat: 37.76, lng: -122.42},
    {lat: 37.77, lng: -122.40},
    {lat: 37.80, lng: -122.40},
    {lat: 37.75, lng: -122.45},
    {lat: 37.80, lng: -122.43},
    {lat: 37.78, lng: -122.41},
    {lat: 37.79, lng: -122.44},
    {lat: 37.80, lng: -122.42},
    {lat: 37.78, lng: -122.41},
    {lat: 37.77, lng: -122.40},
    {lat: 37.78, lng: -122.41},
    {lat: 37.78, lng: -122.44},
    {lat: 37.78, lng: -122.41},
    {lat: 37.77, lng: -122.43},
    {lat: 37.78, lng: -122.41},
    {lat: 37.76, lng: -122.42},
    {lat: 37.78, lng: -122.42},
    {lat: 37.75, lng: -122.44},
    {lat: 37.76, lng: -122.44},
    {lat: 37.76, lng: -122.41},
    {lat: 37.77, lng: -122.44},
    {lat: 37.78, lng: -122.45},
    {lat: 37.78, lng: -122.42},
    {lat: 37.76, lng: -122.41},
];


function draw(geo, pointData) {
    // Some set up.
    const width = 1800;
    const height = 1000;
    const pr = window.devicePixelRatio || 1;

    // Crisp canvas and context.
    const canvas = d3.select('canvas')
      .attr('width', width * pr)
      .attr('height', height * pr)
      .style('width', `${width}px`);
    const context = canvas.node().getContext('2d');
    context.scale(pr, pr);

    // Background.
    // const gradient = context.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, width / 2);
    // gradient.addColorStop(0, '#0C2648');
    // gradient.addColorStop(1, '#091426');
    // context.fillStyle = gradient;
    // context.fillRect(0, 0, width, height);

    // Projection and path.
    const projection = d3.geoAlbers().fitSize([width, height], geo);
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
      .hexRadius(5);

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
      .range(['#293e5a', '#5e6d7c', '#929b9f', '#c7cac1', '#fbf8e3']);

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

// ready(geoData, pointData);
// Load data.
const world = d3.json(
// San Francisco:
'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/san-francisco.geojson'
// 'https://raw.githubusercontent.com/larsvers/map-store/master/us_mainland_geo.json'
// 'https://raw.githubusercontent.com/larsvers/map-store/master/earth-lands-10km.json'
);
//   const points = d3.csv(
//     'https://raw.githubusercontent.com/larsvers/data-store/master/cities_top_10000_world.csv'
//   );

  Promise.all([world]).then(res => {
    console.log('Ready');
    let [geoData] = res;

    draw(geoData, pointData);
  });
//   Promise.all([world, points]).then(res => {
//     let [geoData, userData] = res;
//     ready(geoData, userData);
//   });
