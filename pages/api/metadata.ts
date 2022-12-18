export interface Metadata {
  location: string;
  totalWindows: number;
}

const locationGridId = "grid-g3XU9U3kb8";
const docId = "_ObKm8enqO";
// read-only token for this public database. Feel free to query if you'd like and you're poking around.
const LocationCodaApiToken = "7c6d4082-5564-4ba6-81af-ff7600c5e576";

export default async function handler(req, res) {
  const locationResp = await fetch(
    `https://coda.io/apis/v1/docs/${docId}/tables/${locationGridId}/rows?useColumnNames=true`,
    {
      headers: {
        Authorization: `Bearer ${LocationCodaApiToken}`,
      },
    }
  );
  const locationData = await locationResp.json();
  console.log(locationData);
  const locationMeta = locationData.items.find(
    (ele) => !ele.values.isWindow
  ).values;

  res
    .status(200)
    .json({ ...locationMeta, location: locationMeta.metadata } as Metadata);
}
