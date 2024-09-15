import { Navigation, useMap } from "@mappedin/react-sdk";

export default function DrawNavigation() {
  const { mapData, mapView } = useMap();

  const Coord = mapView.createCoordinate(43.472795, -80.5394083);
  const space = mapData
    .getByType("space")
    .filter((space) => space.floor.id === mapView.currentFloor.id)[10];
  const directions = mapView.getDirections(space,Coord);

  return directions ? <Navigation directions={directions} /> : null;
}
