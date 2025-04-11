import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "../../../ui/dialog";
  import { Separator } from "../../../ui/separator";
  import { ScrollArea } from "../../../ui/scroll-area";
  import React from "react";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import { Button } from "../../../ui/button";
  
  interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: any | null;
  }
  
  export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    meeting,
  }) => {
    if (!meeting) return null;
  
    const formatMediaTable = (title: string, mediaArray: any[]) => {
      return {
        title,
        head: [["ID", "File URL", "Timestamp"]],
        body: mediaArray.map((media) => [
          media.id,
          media.fileUrl,
          new Date(media.timestamp).toLocaleString(),
        ]),
      };
    };
  
    const handleExportPDF = () => {
      const doc = new jsPDF();
      let yOffset = 10;
  
      doc.setFontSize(16);
      doc.text("Meeting Details", 14, yOffset);
      yOffset += 10;
  
      doc.setFontSize(12);
      const fields = [
        ["Title", meeting.title],
        ["Code", meeting.meetLink.split(".com/")[1] || "-"],
        ["Start Time", new Date(meeting.meetingDetails.startTime).toLocaleString()],
        ["End Time", new Date(meeting.meetingDetails.endTime).toLocaleString()],
        ["Scheduled By", meeting.scheduledBy?.email || "Anonymous"],
        ["Role", meeting.scheduledBy.role.name || "-"],
        ["Location", meeting.location || "-"],
      ];
  
      fields.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 14, yOffset);
        yOffset += 7;
      });
  
      const addTableIfDataExists = (title: string, media: any[]) => {
        if (media?.length > 0) {
          doc.addPage();
          const { head, body } = formatMediaTable(title, media);
          autoTable(doc, { startY: 20, head, body });
        } else {
          doc.addPage();
          doc.text(`${title}: No entries found.`, 14, 20);
        }
      };
  
      addTableIfDataExists("Google Drive Media", meeting.googleDriveMedia);
      addTableIfDataExists("Failed Transfers", meeting.gcpMediaNotInStorageLogs);
      addTableIfDataExists("GCP Media", meeting.storageLogs);
  
      doc.save(`meeting_${meeting.meetLink || "details"}.pdf`);
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
          </DialogHeader>
  
          <Separator className="my-4" />
  
          <ScrollArea className="h-[70vh]">
            <div className="space-y-4 text-sm">
              <div>
                <strong>Title:</strong> {meeting.title}
              </div>
              <div>
                <strong>Code:</strong> {meeting.meetLink.split(".com/")[1] || "-"}
              </div>
              <div>
                <strong>Start Time:</strong>{" "}
                {new Date(meeting.meetingDetails.startTime).toLocaleString()}
              </div>
              <div>
                <strong>End Time:</strong>{" "}
                {new Date(meeting.meetingDetails.endTime).toLocaleString()}
              </div>
              <div>
                <strong>Scheduled By:</strong>{" "}
                {meeting.scheduledBy?.email || "Anonymous"}
              </div>
              <div>
                <strong>Role:</strong> {meeting.scheduledBy.role.name || "-"}
              </div>
              <div>
                <strong>Location:</strong> {meeting.location}
              </div>
  
              {/* Google Drive Media */}
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2">Google Drive Media</h3>
                {meeting?.googleDriveMedia?.length > 0 ? (
                  <ul className="space-y-2">
                    {meeting.googleDriveMedia.map((media: any, index: any) => (
                      <li key={media.id || index} className="border p-2 rounded bg-gray-100 text-sm">
                        <p><strong>ID:</strong> {media.id}</p>
                        <p><strong>File URL:</strong> <a href={media.fileUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{media.fileUrl}</a></p>
                        <p><strong>Timestamp:</strong> {new Date(media.timestamp).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-yellow-700 bg-yellow-100 p-2 rounded text-sm">
                    No media uploaded to Google Drive.
                  </div>
                )}
              </div>
  
              {/* Failed Transfers */}
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2 text-red-600">Failed Transfers</h3>
                {meeting?.gcpMediaNotInStorageLogs?.length > 0 ? (
                  <ul className="space-y-2">
                    {meeting.gcpMediaNotInStorageLogs.map((media: any, index: any) => (
                      <li key={media.id || index} className="border p-2 rounded bg-red-100 text-sm">
                        <p><strong>ID:</strong> {media.id}</p>
                        <p><strong>File URL:</strong> <a href={media.fileUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{media.fileUrl}</a></p>
                        <p><strong>Timestamp:</strong> {new Date(media.timestamp).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-yellow-700 bg-yellow-100 p-2 rounded text-sm">
                    Nothing failed to transfer.
                  </div>
                )}
              </div>
  
              {/* GCP Media */}
              <div className="mt-4">
                <h3 className="font-semibold text-sm mb-2">GCP Media</h3>
                {meeting?.storageLogs?.length > 0 ? (
                  <ul className="space-y-2">
                    {meeting.storageLogs.map((media: any, index: any) => (
                      <li key={media.id || index} className="border p-2 rounded bg-gray-100 text-sm">
                        <p><strong>ID:</strong> {media.id}</p>
                        <p><strong>File URL:</strong> <a href={media.fileUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{media.fileUrl}</a></p>
                        <p><strong>Timestamp:</strong> {new Date(media.timestamp).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-yellow-700 bg-yellow-100 p-2 rounded text-sm">
                    No GCP media available.
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
  
          <div className="flex justify-end mt-4 space-x-2">
            <Button onClick={handleExportPDF}>
              Export as PDF
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ReportModal;
  