import { Path, useMap } from "@mappedin/react-sdk";

export default function DrawPath() {
  const { mapData, mapView } = useMap();
  const coordinates = {
    floor : null,
    latitude: 43.473139, 
    longitude: -80.539777
  };

  const space1 = mapData
    .getByType("space")
    .find((space) => space.name.includes("3D Printing"));
  const space2 = mapData
    .getByType("point-of-interest")
    .find((poi) => poi.name.includes("Sponsor Bay"));

  if (space1 == null || space2 == null) {
    return null;
  }

  const directions = mapView.getDirections(coordinates, space2);

  return directions ? (
    <Path
      coordinate={directions.coordinates}
      options={{ color: "goldenrod" }}
    />
  ) : null;
}
