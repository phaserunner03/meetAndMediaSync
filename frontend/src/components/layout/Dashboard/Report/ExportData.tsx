import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportCSV(data: any[], fileName = "meeting_report") {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(data: any[], fileName = "meeting_report") {
  const doc = new jsPDF();
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
      ],
    ],
    body: data.map((meeting) => [
      meeting.title,
      meeting.code,
      meeting.role,
      new Date(meeting.startDate).toLocaleString(),
      new Date(meeting.endDate).toLocaleString(),
      meeting.drive,
      meeting.gcp,
    ]),
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