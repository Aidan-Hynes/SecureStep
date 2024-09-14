import { Navigation, useMap } from "@mappedin/react-sdk";

export default function DrawNavigation() {
  const { mapData, mapView } = useMap();

  const spaces = mapData.getByType("space").filter(
    (space) => space.floor.id === mapView.currentFloor.id
  );

  const space1 = spaces[0];
  const space2 = spaces[10];

  const directions = mapView.getDirections(space1, space2);

  return directions ? <Navigation directions={directions} /> : null;
}
