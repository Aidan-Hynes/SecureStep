import { Navigation, useMap } from "@mappedin/react-sdk";
import React, { useEffect, useRef, useState } from "react";

export default function DrawNavigation({ location }) {
  const { mapData, mapView } = useMap();
  const prevLocationRef = useRef(null);
  const [directions, setDirections] = useState(null);

  // Ensure location is an array and extract latitude and longitude
  const [longitude, latitude] = Array.isArray(location)
    ? location.map(coord => parseFloat(coord))
    : [0, 0]; // Default values if location is not valid

  useEffect(() => {
    const prevLocation = prevLocationRef.current;

    // Only proceed if coordinates are valid and have changed
    if ((latitude !== prevLocation?.latitude || longitude !== prevLocation?.longitude) || ((latitude == null) || (longitude == null))) {
      console.log('Coordinates changed. Updating directions.');

      // Update previous coordinates
      prevLocationRef.current = { latitude, longitude };

      // Create a coordinate object from latitude and longitude
      const Coord = mapView.createCoordinate(latitude, longitude);
      const space2 = mapData
        .getByType("point-of-interest")
        .find((poi) => poi.name.includes("Sponsor Bay"));

      const newDirections = mapView.getDirections(Coord, space2);
      setDirections(newDirections);
    } else {
        //setDirections(null);
      console.log('Coordinates did not change. Skipping update.');
    }
  }, [latitude, longitude, mapData, mapView]);

  // Only render Navigation component if directions are available
  return directions ? <Navigation directions={directions} /> : null;
}
