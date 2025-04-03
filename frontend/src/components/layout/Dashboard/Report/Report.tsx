import { useState } from "react";
import React from "react";
import { toast } from "sonner";
import { DatePicker } from "../../../ui/date-picker";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "../../../ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";

const dummyMeetings = [
  {
    id: "1",
    title: "Team Sync",
    code: "ABC123",
    role: "Admin",
    startDate: new Date("2024-04-01T10:00:00"),
    endDate: new Date("2024-04-01T11:00:00"),
    drive: "Uploaded",
    gcp: "Pending",
    participants: 10,
  },
  {
    id: "2",
    title: "Client Meeting",
    code: "DEF456",
    role: "Member",
    startDate: new Date("2024-04-02T14:00:00"),
    endDate: new Date("2024-04-02T15:00:00"),
    drive: "Pending",
    gcp: "Failed",
    participants: 8,
  },
  // Add more dummy data here...
];

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: "Meeting Title",
  },
  {
    accessorKey: "code",
    header: "Meeting Code",
  },
  {
    accessorKey: "role",
    header: "User Role",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => new Date(row.original.startDate).toLocaleString(),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => new Date(row.original.endDate).toLocaleString(),
  },
  {
    accessorKey: "drive",
    header: "Drive Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded ${
          row.original.drive === "Uploaded"
            ? "bg-green-200 text-green-800"
            : row.original.drive === "Pending"
            ? "bg-yellow-200 text-yellow-800"
            : "bg-red-200 text-red-800"
        }`}
      >
        {row.original.drive}
      </span>
    ),
  },
  {
    accessorKey: "gcp",
    header: "GCP Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded ${
          row.original.gcp === "Uploaded"
            ? "bg-green-200 text-green-800"
            : row.original.gcp === "Pending"
            ? "bg-yellow-200 text-yellow-800"
            : "bg-red-200 text-red-800"
        }`}
      >
        {row.original.gcp}
      </span>
    ),
  },
  {
    accessorKey: "participants",
    header: "Participants",
  },
];

const Report = () => {
  const [filteredData, setFilteredData] = useState(dummyMeetings);
  const [filters, setFilters] = useState({
    code: "",
    role: "",
    startDate: null,
    endDate: null,
    drive: "",
    gcp: "",
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = dummyMeetings.filter((meeting) => {
      return (
        (filters.code ? meeting.code.includes(filters.code) : true) &&
        (filters.role ? meeting.role.includes(filters.role) : true) &&
        (filters.startDate
          ? new Date(meeting.startDate) >= new Date(filters.startDate)
          : true) &&
        (filters.endDate
          ? new Date(meeting.endDate) <= new Date(filters.endDate)
          : true) &&
        (filters.drive ? meeting.drive === filters.drive : true) &&
        (filters.gcp ? meeting.gcp === filters.gcp : true)
      );
    });
    setFilteredData(filtered);
  };

  return (
    <div className="p-6 sm:ml-64 min-h-screen">
      <h1 className="text-2xl font-bold"> Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
        {/* Meeting Code */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Meeting Code
          </label>
          <Input
            value={filters.code}
            onChange={(e) => handleFilterChange("code", e.target.value)}
            className="w-full bg-white"
          />
        </div>

        {/* User Role */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">User Role</label>
          <Input
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-full bg-white"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <DatePicker
            value={filters.startDate}
            onChange={(date: any) => handleFilterChange("startDate", date)}
          />
        </div>
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <DatePicker
            value={filters.endDate}
            onChange={(date: any) => handleFilterChange("endDate", date)}
          />
        </div>

        {/* Drive Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Drive Status
          </label>
          <Select
            value={filters.drive}
            onValueChange={(value) => handleFilterChange("drive", value)}
            
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Drive Status</SelectLabel>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* GCP Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            GCP Status
          </label>
          <Select
            value={filters.gcp} 
            onValueChange={(value) => handleFilterChange("gcp", value)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>GCP Status</SelectLabel>
                <SelectItem value="Uploaded">Uploaded</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters Button */}
        <div className="col-span-full ">
          <Button className="w-full md:w-auto px-6" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Report;
