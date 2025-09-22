export interface Env {
  CODA_API_TOKEN: string;
  LOCATION_CODA_API_TOKEN: string;
}

export enum ActivityType {
  Writing = "Writing",
  Listening = "Listening",
  Reciting = "Reciting",
  Building = "Building",
  Reading = "Reading",
  Moving = "Moving",
}

export interface Activity {
  category: ActivityType;
  name: string;
  link: string;
  displayHTML: string;
  metadata: object;
  date: Date;
}

export interface Metadata {
  location: string;
  totalWindows: number;
}

const DOC_ID = "_ObKm8enqO";
const GRID_ID = "grid-PAKiSBywCk";
const LOCATION_GRID_ID = "grid-g3XU9U3kb8";
const CACHE_TTL = 3600; // 1 hour

function corsHeaders(origin?: string): HeadersInit {
  const allowedOrigin = origin === "https://spencer.place" ? origin : "https://spencer.place";
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

async function handleCachedRequest(request: Request, cacheKey: string, fetchData: () => Promise<any>): Promise<Response> {
  const cache = caches.default;
  const cacheRequest = new Request(cacheKey, { method: "GET" });
  
  let response = await cache.match(cacheRequest);
  
  if (!response) {
    try {
      const data = await fetchData();
      
      response = new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `max-age=${CACHE_TTL}`,
          ...corsHeaders(request.headers.get("Origin")),
        },
      });
      
      await cache.put(cacheRequest, response.clone());
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(request.headers.get("Origin")),
        },
      });
    }
  } else {
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        ...corsHeaders(request.headers.get("Origin")),
      },
    });
    response = newResponse;
  }
  
  return response;
}

async function fetchActivities(env: Env): Promise<Activity[]> {
  const resp = await fetch(
    `https://coda.io/apis/v1/docs/${DOC_ID}/tables/${GRID_ID}/rows?useColumnNames=true&valueFormat=simpleWithArrays&sortBy=natural`,
    {
      headers: {
        Authorization: `Bearer ${env.CODA_API_TOKEN}`,
      },
    }
  );
  
  if (!resp.ok) {
    throw new Error(`Coda API error: ${resp.status}`);
  }
  
  const data = await resp.json();
  
  return data.items.map((item: any) => ({
    ...item.values,
    category: item.values.category as ActivityType,
    date: new Date(item.values.date),
  }));
}

async function fetchMetadata(env: Env): Promise<Metadata> {
  const locationResp = await fetch(
    `https://coda.io/apis/v1/docs/${DOC_ID}/tables/${LOCATION_GRID_ID}/rows?useColumnNames=true`,
    {
      headers: {
        Authorization: `Bearer ${env.LOCATION_CODA_API_TOKEN}`,
      },
    }
  );
  
  if (!locationResp.ok) {
    throw new Error(`Coda API error: ${locationResp.status}`);
  }
  
  const locationData = await locationResp.json();
  const locationMeta = locationData.items.find(
    (ele: any) => !ele.values.isWindow
  ).values;
  
  return { ...locationMeta, location: locationMeta.metadata };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(origin),
      });
    }
    
    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders(origin),
      });
    }
    
    try {
      switch (url.pathname) {
        case "/me":
          return await handleCachedRequest(
            request,
            `${request.url}-activities`,
            () => fetchActivities(env)
          );
          
        case "/metadata":
          return await handleCachedRequest(
            request,
            `${request.url}-metadata`,
            () => fetchMetadata(env)
          );
          
        default:
          return new Response("Not found", {
            status: 404,
            headers: corsHeaders(origin),
          });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });
    }
  },
};