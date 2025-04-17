import { OpenAPIHono } from "@hono/zod-openapi";
import { heartbeatApi } from "./heartbeat";

export const api = new OpenAPIHono()

api.route("/heartbeat", heartbeatApi);
