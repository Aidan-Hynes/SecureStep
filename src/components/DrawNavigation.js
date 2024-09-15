import { Navigation, useMap } from "@mappedin/react-sdk";
import React, { useEffect, useRef, useState } from "react";

export default function DrawNavigation({ location }) {
  const { mapData, mapView } = useMap();
  const prevLocationRef = useRef([null, null]); // Store previous coordinates
  const [directions, setDirections] = useState(null);

  // Ensure location is an array and extract latitude and longitude
  const [longitude, latitude] = Array.isArray(location)
    ? location.map(coord => parseFloat(coord))
    : [0, 0]; // Default values if location is not valid

  useEffect(() => {
    const [prevLat, prevLng] = prevLocationRef.current;

    // Only update directions if coordinates have changed
    if (latitude !== prevLat || longitude !== prevLng) {
      // Update previous coordinates
      prevLocationRef.current = [latitude, longitude];

      // Create a coordinate object from latitude and longitude
      const Coord = mapView.createCoordinate(latitude, longitude);
      const space2 = mapData
        .getByType("point-of-interest")
        .find((poi) => poi.name.includes("Sponsor Bay"));
      
      const newDirections = mapView.getDirections(Coord, space2);
      setDirections(newDirections);
    }
  }, [latitude, longitude, mapData, mapView]);

  return directions ? <Navigation directions={directions} /> : null;
}
