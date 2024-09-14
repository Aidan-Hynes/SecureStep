import React from "react";
import { MapView, useMapData, useMap, Label } from "@mappedin/react-sdk";
import "@mappedin/react-sdk/lib/esm/index.css";
import FloorSelector from "./FloorSelector";
import DrawPath from "./DrawPath";
import DrawNavigation from "./DrawNavigation";




function MyCustomComponent() {
  const { mapView, mapData } = useMap();

  return mapData.getByType("space").map((space) => {
    return <Label target={space.center} text={space.name} />;
  });
}



export default function App() {
  // See Demo API key Terms and Conditions
  // https://developer.mappedin.com/v6/demo-keys-and-maps/
  const { isLoading, error, mapData } = useMapData({
    key: "mik_Qar1NBX1qFjtljLDI52a60753",
    secret: "mis_CXFS9WnkQkzQmy9GCt4ucn2D68zNRgVa2aiJj5hEIFM8aa40fee",
    mapId: "66ce20fdf42a3e000b1b0545",
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  return mapData ? (
    <MapView mapData={mapData} style={{ width: "650px", height: "650px" }} options={{
        initialFloor: mapData
          .getByType("floor")
          .find((floor) => floor.name.includes("2")),
      }}>
      <MyCustomComponent />
      <DrawNavigation />
      {/* <DrawPath /> */}
      <FloorSelector /> {/* Add FloorSelector component here */}

    </MapView>
  ) : null;
}