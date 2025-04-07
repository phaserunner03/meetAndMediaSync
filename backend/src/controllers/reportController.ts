import { Response } from "express";
import { fetchMeetings } from "../services/reportService";
import { AuthenticatedRequest } from "../constants/types.constants";


export const generateReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reportData = await fetchMeetings(req.query);
    res.status(200).json(reportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};