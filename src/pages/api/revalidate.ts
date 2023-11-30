import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerAuthSession({
    req,
    res,
  });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { path } = req.query;
  if (!path) {
    return res.status(400).json({ message: "Path must be a valid string" });
  }
  try {
    await res.revalidate(path as string);
  } catch (err) {
    return res.status(500).json({ message: "Error validating" });
  }

  res.status(200).json({ revalidated: true });
}
