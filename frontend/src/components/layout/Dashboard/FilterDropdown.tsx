import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface FilterDropdownProps {
  filter: string;
  setFilter: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ filter, setFilter }) => {
  return (
    <Select value={filter} onValueChange={setFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Filter" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ourEvents">Our Events</SelectItem>
        <SelectItem value="allEvents">All Events</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default FilterDropdown;
