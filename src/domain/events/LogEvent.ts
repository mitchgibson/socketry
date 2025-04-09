import { z } from "zod";
import { EventSchema } from "./Event.js";

export const LogEventSchema = EventSchema.extend({
  type: z.literal("log"),
  severity: z.enum(["info", "warn", "error"]),
  data: z.object({
    message: z.string(),
  }),
});

export type LogEvent = z.infer<typeof LogEventSchema>;