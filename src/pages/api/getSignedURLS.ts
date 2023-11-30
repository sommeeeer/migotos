import type { NextApiRequest, NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";
import { getSignedURLS } from "~/server/helpers";

type ResponseData = {
  message?: string;
  urls?: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const session = await getServerAuthSession({
    req,
    res,
  });
  if (!session) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { amount } = req.query;
  if (!amount || isNaN(Number(amount))) {
    res.status(400).json({ message: "Amount must be a valid number" });
    return;
  }

  const urls = await getSignedURLS(Number(amount));

  if (!urls) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  res.status(200).json({ urls: urls });
}
