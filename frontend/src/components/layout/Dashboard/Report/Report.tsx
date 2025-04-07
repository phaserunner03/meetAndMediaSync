import { useState } from "react";
import { DatePicker } from "../../../ui/date-picker";
import { ArrowUpDown, MoreHorizontal, ChevronDown } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectGroup,
} from "../../../ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { Checkbox } from "../../../ui/checkbox";
import { ColumnDef, Table } from "@tanstack/react-table";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { DataTable } from "../../../ui/DataTable";
import { exportData } from "./ExportData";
import { format } from "date-fns";

// Define the Meeting interface
interface Meeting {
  id: string;
  title: string;
  code: string;
  role: string;
  startDate: Date;
  endDate: Date;
  drive: string;
  gcp: string;
  participants: number;
}

const dummyMeetings: Meeting[] = Array.from({ length: 20 }, (_, i) => ({
  id: (i + 1).toString(),
  title: `Meeting ${i + 1}`,
  code: `CODE${i + 1}`,
  role: i % 2 === 0 ? "Admin" : "Member",
  startDate: new Date(),
  endDate: new Date(),
  drive: i % 3 === 0 ? "Uploaded" : "Pending",
  gcp: i % 4 === 0 ? "Success" : "Failed",
  participants: Math.floor(Math.random() * 20) + 1,
}));

export const columns: ColumnDef<Meeting>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "code",
    header: "Meeting Code",
    cell: ({ row }) => (
      <div className="text-sm font-mono">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "role",
    header: "User Role",
    cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "startDate",
    header: "Start Time",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("startDate")), "PPpp")}</div>
    ),
  },
  {
    accessorKey: "endDate",
    header: "End Time",
    cell: ({ row }) => (
      <div>{format(new Date(row.getValue("endDate")), "PPpp")}</div>
    ),
  },
  {
    accessorKey: "drive",
    header: "Drive Upload",
    cell: ({ row }) => {
      const status = row.getValue("drive") as string;
      const color =
        status === "Uploaded"
          ? "bg-green-100 text-green-800"
          : status === "Pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-gray-100 text-gray-800";

      return (
        <span
          className={`inline-block text-center w-20 px-3 py-1 text-xs font-medium rounded-full ${color}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "gcp",
    header: "GCP Status",
    cell: ({ row }) => {
      const status = row.getValue("gcp") as string;
      const color =
        status === "Success"
          ? "bg-green-100 text-green-800"
          : status === "Pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800";

      return (
        <span
          className={`inline-block text-center w-20 px-3 py-1 text-xs font-medium rounded-full ${color}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "participants",
    header: "Participants",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("participants")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const meeting = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(meeting.code)}
            >
              Copy Meeting Code
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const Report = () => {
  const [filteredData, setFilteredData] = useState(dummyMeetings);
  const [exportFormat, setExportFormat] = useState("csv");
  const [tableInstance, setTableInstance] = useState<any>(null);
  const [columnVersion, setColumnVersion] = useState(0);

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
  const renderColumnDropdown = () => {
    if (!tableInstance) return null;
    const handleToggleVisibility = (column: any, value: boolean) => {
      column.toggleVisibility(value);
      setColumnVersion((v) => v + 1); 
    };
    return (
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Columns <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {tableInstance
          .getAllLeafColumns()
          .filter((column: any) => column.getCanHide())
          .map((column: any) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={() => handleToggleVisibility(column,true)}
              className="capitalize"
            >
              {column.columnDef.header?.toString() || column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
    );
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
      <div className="flex flex-wrap justify-between items-center gap-3 pt-4">
        <div className="flex items-center gap-2">
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => exportData(filteredData, exportFormat)}>
            Export
          </Button>
        </div>

        {renderColumnDropdown()}
      </div>
      <div className="pt-6 ">
        <DataTable
          columns={columns}
          data={filteredData}
          onTableReady={setTableInstance}
        />
      </div>
    </div>
  );
};
export default Report;
