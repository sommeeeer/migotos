import type { NextApiRequest, NextApiResponse } from "next/types";
import { db } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      // if (process.env.NODE_ENV !== "development") {
        const catId = req.query.id;
        if (!catId) {
          return res.status(400).json({ message: "Missing catId" });
        }
        await db.cat.update({
          where: { id: Number(catId) },
          data: { visited: { increment: 1 } },
        });
      // }
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