import { Role } from '../../../prisma/generated/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z, type TypeOf } from 'zod';
import { getServerAuthSession } from '~/server/auth';
import { getSignedURLS } from '~/server/helpers';

type ResponseData = {
  message?: string;
  urls?: string[];
};

const body = z.object({
  filenames: z.array(z.string()),
});

export interface NextApiRequestWithBody extends NextApiRequest {
  // use TypeOf to infer the properties from helloSchema
  body: TypeOf<typeof body>;
}

export default async function handler(
  req: NextApiRequestWithBody,
  res: NextApiResponse<ResponseData>
) {
  const session = await getServerAuthSession({
    req,
    res,
  });
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (session.user.role !== Role.ADMIN) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { filenames } = req.body;
  if (!filenames || !Array.isArray(filenames)) {
    res.status(400).json({ message: 'Filenames must be an array' });
    return;
  }

  const urls = await getSignedURLS(filenames);

  if (!urls) {
    res.status(500).json({ message: 'Internal server error' });
    return;
  }

  res.status(200).json({ urls: urls });
}
