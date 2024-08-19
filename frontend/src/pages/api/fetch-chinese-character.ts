import type { NextApiRequest, NextApiResponse } from "next";

const LAMBDA_ENDPOINT = `https://n8tqclsixf.execute-api.eu-west-3.amazonaws.com/fetch-chinese-character`;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT);
    const data = await response.json();
    res.status(200).json(data.character);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch data from Lambda function" });
  }
};
