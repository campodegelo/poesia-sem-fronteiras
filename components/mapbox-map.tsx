import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import geoJson from "../custom.geo.json";
// import the mapbox-gl styles so that the map is displayed correctly

function MapboxMap() {
  // this is where the map instance will be stored after initialization
  const [map, setMap] = useState<mapboxgl.Map>();

  // React ref to store a reference to the DOM node that will be used
  // as a required parameter `container` when initializing the mapbox-gl
  // will contain `null` by default
  const mapNode = useRef(null);

  const [lng, setLng] = useState(25);
  const [lat, setLat] = useState(25);
  const [zoom, setZoom] = useState(2);

  const [countryName, setCountryName] = useState("");
  const [countryISO3, setCountryISO3] = useState("");
  const [countryWasClicked, setCountryWasClicked] = useState(false);

  useEffect(() => {
    const node = mapNode.current;
    let hoveredCountry: string | number | undefined = '';
    // if the window object is not found, that means
    // the component is rendered on the server
    // or the dom node is not initialized, then return early
    if (typeof window === "undefined" || node === null) return;

    // otherwise, create a map instance
    const mapboxMap = new mapboxgl.Map({
      container: node,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      style: "mapbox://styles/campodegelo/ck6tgsp387nkz1imw0h5okcha",
      center: [lng, lat],
      zoom: zoom,
    });

    // LOAD COORDINATES AND BORDER INFO FROM getJSON FILE
    mapboxMap.on("load", function () {
      mapboxMap.addSource("countries", {
        type: "geojson",
        data: geoJson,
        generateId: true,
      });

      mapboxMap.addLayer({
        id: "countries-layer",
        type: "fill",
        source: "countries",
        layout: {},
        paint: {
          "fill-color": "#D14545",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0.01,
          ],
        },
      });

      mapboxMap.addLayer({
        id: "borders-layer",
        type: "line",
        source: "countries",
        layout: {},
        paint: {
          // "line-color": "#48896D",
          "line-color": "black",
          "line-width": 0.1,
        },
      });
    });

    // Add zoom and rotation controls to the mapboxMap.
    mapboxMap.addControl(new mapboxgl.NavigationControl());

    // Event Handlers on the map
    mapboxMap.on("click", "countries-layer", function (e) {
      if (e?.features?.length && e?.features[0]?.properties) {
        console.log("country name = ", e?.features[0]?.properties?.name);
        console.log("ISO 3 = ", e?.features[0]?.properties?.adm0_a3);

        setCountryName(e.features[0].properties.name);
        setCountryISO3(e.features[0].properties.adm0_a3);
        setCountryWasClicked(true);
      }
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    mapboxMap.on("mousemove", "countries-layer", function (e) {
      if (e?.features?.length) {
        mapboxMap.getCanvas().style.cursor = "pointer";
        // console.log(e.features);
        if (hoveredCountry) {
          mapboxMap.removeFeatureState({
            source: "countries",
            id: hoveredCountry,
          });
        }
        hoveredCountry = e.features[0].id;
        mapboxMap.setFeatureState(
          { source: "countries", id: hoveredCountry },
          { hover: true }
        );
      }
    });

    // Change it back to a pointer when it leaves.
    mapboxMap.on("mouseleave", "countries-layer", function (e) {
      mapboxMap.getCanvas().style.cursor = "";
      mapboxMap.setFeatureState(
        { source: "countries", id: hoveredCountry },
        { hover: false }
      );
      hoveredCountry = '';
    });

    // updating coordinates
    mapboxMap.on("move", () => {
      setLng(parseInt(mapboxMap.getCenter().lng.toFixed(4)));
      setLat(parseInt(mapboxMap.getCenter().lat.toFixed(4)));
      setZoom(parseInt(mapboxMap.getZoom().toFixed(2)));
    });

    // save the map object to React.useState
    setMap(mapboxMap);

    return () => {
      mapboxMap.remove();
    };
  }, []);

  return <div ref={mapNode} style={{ width: "100%", height: "100%" }} />;
}

export default MapboxMap;
