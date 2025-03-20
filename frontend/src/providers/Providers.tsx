import { ReactNode } from "react";
import { AuthProvider } from "../context/authContext";
import { MeetingProvider } from "../context/meetingContext";
import { DriveProvider } from "../context/driveContext";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <AuthProvider>
    <MeetingProvider>
      <DriveProvider>{children}</DriveProvider>
    </MeetingProvider>
  </AuthProvider>
);

export default Providers;
