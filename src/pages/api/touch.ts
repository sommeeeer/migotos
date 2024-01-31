import type { NextApiRequest, NextApiResponse } from "next/types";
import { db } from "~/server/db";

async function incrementCounter() {
  const counter = await db.counter.findFirst();
  if (!counter) {
    await db.counter.create({ data: { count: 1 } });
  } else {
    await db.counter.update({
      where: { id: counter.id },
      data: { count: counter.count + 1 },
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      if (process.env.NODE_ENV !== "development") {
        await incrementCounter();
      }
      res.status(200).json({ message: "Counter incremented successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "An error occurred while incrementing the counter" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
