import { Navigation, useMap } from "@mappedin/react-sdk";

export default function DrawNavigation() {
  const { mapData, mapView } = useMap();

  const Coord = mapView.createCoordinate(43.473139, -80.539777);
  const space = mapData
    .getByType("space")
    .filter((space) => space.floor.id === mapView.currentFloor.id)[10];
  const directions = mapView.getDirections(space,Coord);

  return directions ? <Navigation directions={directions} /> : null;
}
