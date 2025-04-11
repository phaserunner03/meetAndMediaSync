import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportCSV(data: any[], fileName = "meeting_report") {
  const formattedData = data.map((meeting) => {
    const participants = meeting.meetingDetails.participants || [];

    const participantDetails = participants
      

    return {
      "Meeting Title": meeting.title,
      "Meeting Code": meeting.meetLink?.split("/").pop() || "N/A",
      "User Role": meeting.scheduledBy?.role?.name || "N/A",
      "Start Date": new Date(meeting.meetingDetails.startTime).toLocaleString(),
      "End Date": new Date(meeting.meetingDetails.endTime).toLocaleString(),
      "Drive Status": meeting.drive,
      "GCP Status": meeting.gcp,
      "Participants": `${participants.length} (${participantDetails})`,
      "Scheduled By": meeting.scheduledBy?.email || "N/A",
    };
  });

  const csv = Papa.unparse(formattedData);const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(data: any[], fileName = "meeting_report") {
  
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text("Meeting Report", 14, 10);
  

  autoTable(doc, {
    head: [
      [
        "Meeting Title",
        "Meeting Code",
        "User Role",
        "Start Date",
        "End Date",
        "Drive Status",
        "GCP Status",
        "Particpants",
        "Scheduled By"
      ],
    ],
    body: data.map((meeting) => [
      meeting.title,
      meeting.meetLink?.split("/").pop() || "N/A",
      meeting.scheduledBy?.role?.name || "N/A",
      new Date(meeting.meetingDetails.startTime).toLocaleString() || "N/A",
      new Date(meeting.meetingDetails.endTime).toLocaleString() ||"N/A",
      meeting.drive,
      meeting.gcp,
      meeting.meetingDetails.participants?.length || 0,
      meeting.scheduledBy?.email || "N/A",
    ]),
    columnStyles: {
      0: { cellWidth: 40 }, // Meeting Title
      1: { cellWidth: 30 }, // Meeting Code
      2: { cellWidth: 25 }, // User Role
      3: { cellWidth: 35 }, // Start Date
      4: { cellWidth: 35 }, // End Date
      5: { cellWidth: 25 }, // Drive Status
      6: { cellWidth: 25 }, // GCP Status
      7: { cellWidth: 20 }, // Participants
      8: { cellWidth: 40 }, // Scheduled By
    },
    styles: {
      fontSize: 8,
    },
  });

  doc.save(`${fileName}.pdf`);
}

export function exportText(data: any[], fileName = "meeting_report") {
  // Convert data array to a text format
  const textContent = data.map((row) => JSON.stringify(row)).join("\n");

  // Create a Blob and a download link
  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.txt`;
  a.click();

  URL.revokeObjectURL(url);
}

export function exportData(data: any[], format: string) {
    switch (format) {
      case "csv":
        exportCSV(data);
        break;
      case "pdf":
        exportPDF(data);
        break;
      case "text":
        exportText(data);
        break;
      default:
        console.warn("Unsupported format selected");
    }
  }