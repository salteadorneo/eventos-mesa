import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async () => {
    const events = await getCollection("event");

    return new Response(JSON.stringify(events), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};