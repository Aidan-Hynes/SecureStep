import { Model, useMap } from "@mappedin/react-sdk";

export default function Models() {
  const { mapData } = useMap();

  // Filter spaces by name containing "Hacking"
  const mallOffices = mapData
    .getByType("space")
    .filter((space) => space.name.includes("Hacking"));

  return (
    <Model
      models={mallOffices.map((space) => ({
        target: space,
        scale: [0.05, 0.05, 0.05],
        rotation: [90, 0, 0],
        opacity: 0.5,
      }))}
      options={{
        url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
      }}
    />
  );
}
