import argparse
import collections
import glob
import json
import os
import shutil


DEFAULT_SUBMODULE_PATH = "gitmaps/public/data"


def find(elements, select_fn):
    for el in elements:
        if select_fn(el):
            return el
    raise ValueError("Element matching condition not found.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Retrieve map geojsons from the submodule")
    parser.add_argument(
        "--input",
        help="Path to the maps within the submodule. Defaults to {}".format(DEFAULT_SUBMODULE_PATH),
        default=DEFAULT_SUBMODULE_PATH,
    )
    parser.add_argument(
        "--config",
        help="Optional path to the config to add the maps to." 
    )
    parser.add_argument("output", help="Path .", default=DEFAULT_SUBMODULE_PATH)
    args = parser.parse_args()
    geojson_pattern = os.path.join(args.input, "*.geojson")
    geojson_paths = glob.glob(geojson_pattern)
    metadata_paths = [gj.replace(".geojson", ".metadata.json") for gj in geojson_paths]

    Result = collections.namedtuple("Result", ["label", "value"])

    # Copy geojsons from submodule
    results = []
    for geojson_path, metadata_path in zip(geojson_paths, metadata_paths):
        with open(metadata_path, "r") as metadata_file:
            metadata = json.load(metadata_file)
            if not metadata.get("pointsInsteadOfPolygons"):
                label = metadata["locationName"]
                filename = os.path.basename(geojson_path)
                outpath = os.path.join(args.output, filename)
                value, _ = os.path.splitext(filename)
                results.append(Result(label=label, value=value))
                shutil.copy(geojson_path, outpath)
    print("Copied {} maps from the submodule".format(len(results)))

    if args.config:
        # Read existing config file
        with open(args.config, "r") as config_file:
            config = json.load(config_file)

        # Populate options with new data
        display = find(config["style"], lambda grp: grp["id"] == "display")
        display_map = find(display["elements"], lambda el: el["id"] == "map")
        display_map["options"] = [{"label": result.label, "value": result.value} for result in results]

        # Ensure default value is still valid -- remove if not
        all_locations = {result.value for result in results}
        if display_map.get("defaultValue") not in all_locations:
            display_map["defaultValue"] = None
            print("Defaul value removed -- Map did not exist")

        # Recreate the config file
        with open(args.config, "w") as config_file:
            json.dump(config, config_file, indent=4)
