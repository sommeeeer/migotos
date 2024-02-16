import type { NextApiRequest, NextApiResponse } from "next/types";
import { db } from "~/server/db";

async function incrementCounter(userAgent: string | undefined) {
  const counter = await db.counter.findFirst();
  if (!counter) {
    await db.counter.create({ data: { count: 1 } });
  } else {
    await db.counter.update({
      where: { id: counter.id },
      data: { count: counter.count + 1 },
    });
  }
  if (userAgent) {
    await db.visitor.create({
      data: { ua: userAgent },
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
        await incrementCounter(req.headers["user-agent"]);
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
