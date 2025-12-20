import React from 'react';
import { School } from '../../services/SchoolService';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface SchoolSelectorProps {
  schools: School[];
  selectedSchool: number | null;
  onSchoolChange: (schoolId: number) => void;
}

export function SchoolSelector({ schools, selectedSchool, onSchoolChange }: SchoolSelectorProps) {
  return (
    <Select value={selectedSchool ? String(selectedSchool) : ''} onValueChange={v => onSchoolChange(Number(v))}>
      <SelectTrigger className="min-w-[140px]">
        <SelectValue placeholder="Seleccionar colegio" />
      </SelectTrigger>
      <SelectContent>
        {schools.map(school => (
          <SelectItem key={school.id} value={String(school.id)}>{school.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
