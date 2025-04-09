import { z } from "zod";

export const EventSchema = z.object({
  type: z.string(),
  data: z.record(z.string(), z.any()),
});

export type Event = z.infer<typeof EventSchema>;

