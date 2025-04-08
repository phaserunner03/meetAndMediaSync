import { ReactNode } from "react";
import { AuthProvider } from "../context/authContext";
import { MeetingProvider } from "../context/meetingContext";
import { DriveProvider } from "../context/driveContext";
import { ReportProvider } from "../context/reportContext";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <AuthProvider>
    <MeetingProvider>
      <ReportProvider>
        <DriveProvider>{children}</DriveProvider>
      </ReportProvider>
    </MeetingProvider>
  </AuthProvider>
);

export default Providers;
