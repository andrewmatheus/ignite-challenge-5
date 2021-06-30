import { NextApiRequest, NextApiResponse } from 'next';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.clearPreviewData();
  const redirectedTime = 307;
  res.writeHead(redirectedTime, { Location: '/' });
  res.end();
};
