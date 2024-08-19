import type { NextApiRequest, NextApiResponse } from "next";

const LAMBDA_ENDPOINT = `https://n8tqclsixf.execute-api.eu-west-3.amazonaws.com/character-known`;
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({ id: req.body.id }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch data from Lambda function" });
  }
};
