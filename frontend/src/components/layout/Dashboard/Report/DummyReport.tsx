import React, { useEffect, useState } from "react";
import axiosInstance from "../../../../utils/axiosConfig";
import { ArrowUpDown, MoreHorizontal, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../../../ui/select";
import { DatePicker } from "../../../ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { Checkbox } from "../../../ui/checkbox";
import { useReportContext } from "../../../../context/reportContext";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import {
  Table,
  TableHead,
  TableCell,
  TableHeader,
  TableBody,
  TableRow,
} from "../../../ui/table";
import { exportData } from "./ExportData";

export interface Meeting {
  id: string;
  title: string;
  description: string;
  location: string;
  meetLink: string;
  scheduledBy: {
    email: string;
    role: Record<string, any>; // adjust as needed
  };
  meetingDetails: {
    meetingDate: string;
    meetingHistory: string;
    meetingType: string;
    participants: string[];
    startTime: Date;
    endTime: Date;
  };
  googleDriveMedia: any[];
  storageLogs: any[];
  [key: string]: any;
}

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
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const displayTitle =
        title.length > 10 ? `${title.slice(0, 10)}...` : title;

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{displayTitle}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "meetLink",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Meeting Code
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="px-4  text-gray-900">
          {String(row.getValue("meetLink")).split(".com/")[1] || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "scheduledBy",
    id: "scheduledBy",
    header: "Scheduled By",
    cell: ({ row }) => {
      const userId = row.original.scheduledBy?.email;
      return <div className="text-gray-900">{userId ?? "Anonymous"}</div>;
    },
  },
  {
    accessorKey: "scheduledBy.role.name",
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.scheduledBy?.role?.name || "-";
      return <div className="capitalize text-gray-900">{roleName || "-"}</div>;
    },
  },
  {
    accessorKey: "startTime",
    id: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      const startTime = row.original.meetingDetails?.startTime;

      if (!startTime) return <div className="text-gray-500">-</div>;

      const date = new Date(startTime);
      const onlyTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const fullDateTime = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="capitalize  text-gray-900 cursor-pointer">
                {onlyTime}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullDateTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "endTime",
    id: "endTime",
    header: "End Time",
    cell: ({ row }) => {
      const endTime = row.original.meetingDetails?.endTime;

      if (!endTime) return <div className="text-gray-500">-</div>;

      const date = new Date(endTime);
      const onlyTime = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const fullDateTime = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="capitalize  text-gray-900 cursor-pointer">
                {onlyTime}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{fullDateTime}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "driveStatus",
    header: "Drive Status",
    cell: ({ row }) => {
      const mediaCount = row.original.googleDriveMedia?.length ?? 0;
      const hasMedia = mediaCount > 0;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-full text-white w-fit ${
                  hasMedia ? "bg-green-500" : "bg-yellow-500"
                }`}
              >
                {hasMedia ? "Uploaded" : "No Media"}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {mediaCount} image{mediaCount === 1 ? "" : "s"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "gcpStatus",
    header: "GCP Status",
    cell: ({ row }) => {
      const mediaLogs = row.original.googleDriveMedia?.length ?? 0;
      const gcpLogs = row.original.storageLogs?.length ?? 0;
      const pending = Math.max(mediaLogs - gcpLogs, 0);

      const status =
        mediaLogs === 0
          ? "No need"
          : gcpLogs === mediaLogs
          ? "Transferred"
          : gcpLogs === 0 &&(mediaLogs!=1)
          ? "Failed"
          : "Pending";

      const color =
        status === "Transferred"
          ? "bg-green-500"
          : status === "Failed"
          ? "bg-red-500"
          : status === "No need"
          ? "bg-gray-500"
          : "bg-yellow-500";

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`text-xs font-semibold px-2 py-1 rounded-full text-white w-fit ${color}`}
              >
                {status}
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-sm">
              <p>Total: {mediaLogs}</p>
              <p>Transferred: {gcpLogs}</p>
              <p>Pending: {pending}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },

  {
    id: "participants",
    header: "Participants",
    cell: ({ row }) => {
      const participants = row.original.meetingDetails.participants || [];

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs  text-center font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer ">
                {participants.length}
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs max-h-52 overflow-y-auto"
            >
              <ul className="text-sm list-disc pl-4 pr-2">
                {participants.map((name: string, index: number) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const DummyReport = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [exportFormat, setExportFormat] = useState("csv");
  const [filters, setFilters] = useState({
    title: "",
    startTime: null,
    endTime: null,
    scheduledBy: "",
    role: "",
    driveStatus: "",
    gcpStatus: "",
  });
  const [roles, setRoles] = useState<
    {
      _id: string;
      name: string;
    }[]
  >([]);
  const { meetings, fetchMeetingsWithFilters, loading } = useReportContext();
  const [filteredData, setFilteredData] = useState<Meeting[]>([]);

  useEffect(() => {
    if (!loading) {
      setFilteredData(meetings);
    }
  }, [meetings, loading]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axiosInstance.get("roles/v1/allRoles");
        setRoles(res.data.data.roles);
        console.log(res.data.data.roles);
      } catch (error) {
        console.error("Failed to fetch roles", error);
      }
    };

    fetchRoles();
  }, []);

  const [pageSize, setPageSize] = useState(10);
  const table = useReactTable({
    data: filteredData,
    columns: columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const applyFilters = async () => {
    await fetchMeetingsWithFilters({
      title: filters.title,
      startTime: filters.startTime || undefined,
      endTime: filters.endTime || undefined,
      scheduledBy: filters.scheduledBy,
      roleId: filters.role,
      drive: filters.driveStatus,
      gcp: filters.gcpStatus,
    });
  };
  const clearFilters = async () => {
    setFilters({
      title: "",
      startTime: null,
      endTime: null,
      scheduledBy: "",
      role: "",
      driveStatus: "",
      gcpStatus: "",
    });
    await fetchMeetingsWithFilters({});
  };

  return (
    <div className="p-6 sm:ml-64 min-h-screen">
      <h1 className="text-2xl font-bold"> Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg mt-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Title</label>
          <Input
            value={filters.title}
            placeholder="Search by title"
            onChange={(e) => handleFilterChange("title", e.target.value)}
            className="w-full bg-white"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm  text-gray-700">Start Time</label>
          <DatePicker
            value={filters.startTime}
            onChange={(date: any) => handleFilterChange("startTime", date)}
          />
        </div>

        {/* End Time */}
        <div className="flex flex-col">
          <label className="text-sm  text-gray-700">End Time</label>

          <DatePicker
            value={filters.endTime}
            onChange={(date: any) => handleFilterChange("endTime", date)}
          />
        </div>

        {/* Scheduled By */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Scheduled By</label>
          <Input
            value={filters.scheduledBy}
            placeholder="Search by email"
            onChange={(e) => handleFilterChange("scheduledBy", e.target.value)}
            className="w-full bg-white"
          />
        </div>

        {/* Role Dropdown */}
        <div className="flex flex-col">
          <label className="text-sm  text-gray-700">Role</label>
          <Select
            value={filters.role}
            onValueChange={(value) => handleFilterChange("role", value)}
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.name} value={role._id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">Drive Status</label>
          <Select
            value={filters.driveStatus}
            onValueChange={(value) => handleFilterChange("driveStatus", value)}
          >
            <SelectTrigger className="w-[200px] w-full bg-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no media">No Media</SelectItem>
              <SelectItem value="uploaded">Uploaded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-700">GCP Status</label>
          <Select
            value={filters.gcpStatus}
            onValueChange={(value) => handleFilterChange("gcpStatus", value)}
          >
            <SelectTrigger className="w-[200px] w-full bg-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transferred">Transferred</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-full flex flex-wrap gap-4">
          <Button className="w-full md:w-auto px-6" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="w-full md:w-auto px-6"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </div>
      <div className="flex items-center py-4">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm">Rows per page:</label>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const newSize = Number(value);
              setPageSize(newSize);
              table.setPageSize(newSize);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DummyReport;
