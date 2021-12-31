# Hexgrid Map
Data Studio Community Visualization for displaying hexgrid maps.

See it in use [here](https://datastudio.google.com/reporting/c66c9909-ae0b-4a19-a7ba-296e04e5a0f3).

![report-example](img/calfire-report.png)

## Usage
The easiest way to use this visualization is to directly use Data Studio to access the community visualization. This can be done by directly linking to its Google Cloud Bucket: `gs://hexgrid-map-dev/master`. By default, this includes the following selection of maps:

Continents:
- Africa
- Asia
- Europe
- North America
- South America
- Oceania

Countries:
- Australia
- Canada
- China
- France
- Germany
- Greece
- India
- Italy
- Mexico
- Taiwan
- United Kingdom
- United States

States:
- California

Cities:
- Amsterdam
- New York City
- Phoenix
- San Francisco

If these are not to your liking, you are encouraged to fork the repository and add the maps you need, it's easy!

## Developing
### First-time Setup
The main things you'll need to do are: install the dependencies, download the maps, bundle the JS code. This can be done by running the following commands:

```
npm install
npm run map
npm run build
```

In order to upload the result to your cloud storage bucket, make sure to set it up in your `package.json` config.
```
  ...
  "config": {
    "gcsLocation": "gs://<YOUR-BUCKET-HERE>",
    ...
  }
  ...
```

You can then upload your visualization by running `npm run upload`.

### Workflow
- During normal development you only need to run `npm run build` to re-bundle the JS code.
- If you want to see the updates in your visualization you'll need to update your code in cloud storage with `npm run update`.

### Adding maps
You can configure the maps by adding file names from [this repository](https://github.com/codeforgermany/click_that_hood/tree/main/public/data) to the `package.json` config as seen below:

```
  ...
  "config": {
    ...
    "maps": "london berlin"
  }
  ...
```

Once you've added your maps to the config, you can run `npm run map` to download the new maps. They will then be included into the bundled JS the next time you run the build command.

*If your map is not available in that repository, you will have to find your own `.geojson` file.*

In order to make these new maps selectable from your report you also will need to change `src/hexgrid-map.json` as seen below:

```
          {
            "type": "SELECT_SINGLE",
            "id": "map",
            "label": "Map",
            "defaultValue": "united-states",
            "options": [
              {
                "label": "Berlin",
                "value": "berlin"
              },
              {
                "label": "London",
                "value": "london"
              },
            ]
          },
```
