// components/report/ReportModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Separator } from "../../../ui/separator";
import { ScrollArea } from "../../../ui/scroll-area";
import React from "react";

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
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-2">Google Drive Media</h3>

              {meeting?.googleDriveMedia &&
              meeting.googleDriveMedia.length > 0 ? (
                <ul className="space-y-2">
                  {meeting.googleDriveMedia.map((media: any, index: any) => (
                    <li
                      key={media.id || index}
                      className="border p-2 rounded bg-gray-100 text-sm"
                    >
                      <p>
                        <strong>ID:</strong> {media.id}
                      </p>
                      <p>
                        <strong>File URL:</strong>{" "}
                        <a
                          href={media.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {media.fileUrl}
                        </a>
                      </p>
                      <p>
                        <strong>Timestamp:</strong>{" "}
                        {new Date(media.timestamp).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-yellow-700 bg-yellow-100 p-2 rounded text-sm">
                  No media uploaded to Google Drive.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2 text-red-600">
              Failed Transfers
            </h3>
            {meeting?.gcpMediaNotInStorageLogs &&
            meeting.gcpMediaNotInStorageLogs.length > 0 ? (
              <ul className="space-y-2">
                {meeting.gcpMediaNotInStorageLogs.map(
                  (media: any, index: any) => (
                    <li
                      key={media.id || index}
                      className="border p-2 rounded bg-red-100 text-sm"
                    >
                      <p>
                        <strong>ID:</strong> {media.id}
                      </p>
                      <p>
                        <strong>File URL:</strong>{" "}
                        <a
                          href={media.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {media.fileUrl}
                        </a>
                      </p>
                      <p>
                        <strong>Timestamp:</strong>{" "}
                        {new Date(media.timestamp).toLocaleString()}
                      </p>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="text-yellow-700 bg-yellow-100 p-2 rounded text-sm">
                Nothing failed to transfer
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-sm mb-2">
              GCP Media
            </h3>
            {meeting?.storageLogs && meeting.storageLogs.length > 0 ? (
              <ul className="space-y-2">
                {meeting.storageLogs.map((media: any, index: any) => (
                  <li
                    key={media.id || index}
                    className="border p-2 rounded bg-gray-100 text-sm"
                  >
                    <p>
                      <strong>ID:</strong> {media.id}
                    </p>
                    <p>
                      <strong>File URL:</strong>{" "}
                      <a
                        href={media.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {media.fileUrl}
                      </a>
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(media.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="text-yellow-700 bg-yellow-100 p-2 rounded text-sm">
                No GCP media available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
