import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";

interface MeetingFilterProps {
  view: string;
  setView: (view: string) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
}

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const MeetingFilter: React.FC<MeetingFilterProps> = ({ view, setView, setMonth, setYear }) => {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
      {/* Month & Year Selectors */}
      <div className="flex gap-4">
        <Select onValueChange={(value) => setMonth(Number(value))}>
          <SelectTrigger className="w-[140px] border border-gray-300 rounded-md">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setYear(Number(value))}>
          <SelectTrigger className="w-[140px] border border-gray-300 rounded-md">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {[2023, 2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Toggle */}
      <ToggleGroup
        type="single"
        className="rounded-lg border bg-gray-100 p-1 flex"
        defaultValue={view}
        onValueChange={(val: string) => val && setView(val)}
      >
        <ToggleGroupItem
          value="card"
          className={`px-6 py-2 text-sm font-medium rounded-md transition ${
            view === "card" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"
          }`}
        >
          Card View
        </ToggleGroupItem>
        <ToggleGroupItem
          value="calendar"
          className={`px-6 py-2 text-sm font-medium rounded-md transition ${
            view === "calendar" ? "bg-blue-500 text-white" : "bg-white hover:bg-gray-200"
          }`}
        >
          Calendar View
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default MeetingFilter;
