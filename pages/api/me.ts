// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/**
 * example object for v0
 * listening -> last listened on spotify
 * reading -> last reading on goodreads
 * watching -> last watched on letterboxd
 * building -> last github repo commit
 * dancing to -> last song added to my dance playlist
 * moving -> last strava activity
 */

interface Activity {
  name: string;
  link: string;
  displayHTML: string;
  metadata: object;
  date: Date;
}

const CodaApiToken = "56aa6b4f-ede3-45a5-b571-bdbd626b58dd";
const docId = "_ObKm8enqO";
const gridId = "grid-PAKiSBywCk";

export default async function handler(req, res) {
  const resp = await fetch(
    `https://coda.io/apis/v1/docs/${docId}/tables/${gridId}/rows?useColumnNames=true&valueFormat=rich`,
    {
      headers: {
        Authorization: `Bearer ${CodaApiToken}`,
      },
    }
  );
  const response = await resp.json();

  const data = await response.json();

  res.send(200).json(
    data.items.map((item: any) => ({
      ...item.values,
      date: new Date(item.values.date),
    })) as Activity[]
  );
}
