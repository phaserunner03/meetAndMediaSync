import React, { useState } from "react";
import { useMeetings } from "../../../context/meetingContext";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { toast } from "sonner"; // ✅ Import ShadCN Sonner
import { Loader2 } from "lucide-react"; // ✅ Loading icon

const months = [...Array(12)].map((_, i) => ({
  value: i + 1,
  label: new Date(2025, i).toLocaleString("default", { month: "short" }),
}));

const years = [2023, 2024, 2025];

const MeetingFilter: React.FC = () => {
  const { setSearchQuery, setSelectedDay, setMonth, setYear, month, year } = useMeetings();
  const [day, setDay] = useState("");
  const [isLoading, setIsLoading] = useState(false); // ✅ Page-level loader state

  const handleMonthChange = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setMonth(Number(value));
      toast.success(`📅 Month changed to ${months.find(m => m.value === Number(value))?.label}`);
      setIsLoading(false);
    }, 700);
  };

  const handleYearChange = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setYear(Number(value));
      toast.success(`📆 Year changed to ${value}`);
      setIsLoading(false);
    }, 700);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDay(selectedDate);
    setSelectedDay(selectedDate || null);
    toast.success(`📌 Filter applied for ${selectedDate}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative">
      {/* Full-page loader */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <Loader2 className="w-10 h-10 text-gray-700 animate-spin" />
        </div>
      )}

      {/* Filter UI */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-4">
          <Select onValueChange={handleMonthChange} value={String(month)}>
            <SelectTrigger className="w-[140px] border border-gray-300 rounded-md">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={handleYearChange} value={String(year)}>
            <SelectTrigger className="w-[140px] border border-gray-300 rounded-md">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input placeholder="🔎 Search Meetings..." onChange={handleSearchChange} />
        <Input type="date" value={day} onChange={handleDateChange} />
      </div>
    </div>
  );
};

export default MeetingFilter;
