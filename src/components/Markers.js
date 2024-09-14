import { Marker, useMap } from "@mappedin/react-sdk";
import { useState } from "react";

// Function to generate a random hex color
function getRandomHexColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const colorString = ("000000" + randomColor).slice(-6);
  return "#" + colorString;
}

// Custom marker component with random color on click
function CustomMarker() {
  const [color, setColor] = useState("white");

  return (
    <div
      style={{
        backgroundColor: color,
        padding: "10px",
        border: "1px solid black",
        userSelect: "none",
      }}
      onClick={() => {
        setColor(getRandomHexColor());
      }}
    >
      Hello, world!
    </div>
  );
}

// Main Labels component
export default function Labels() {
  const { mapData, mapView } = useMap();

  // Get a specific space on the current floor to place the marker
  const targetSpace = mapData
    .getByType("space")
    .filter((space) => space.floor.id === mapView.currentFloor.id)[15];

  return (
    <>
      {targetSpace && (
        <Marker
          target={targetSpace.center}
          options={{
            rank: "always-visible",
          }}
        >
          <CustomMarker />
        </Marker>
      )}
    </>
  );
}
