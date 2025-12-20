import React from 'react';
import { SchoolClass } from '../services/SchoolService';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface ClassSelectorProps {
  classes: SchoolClass[];
  selectedClass: number | null;
  onClassChange: (classId: number) => void;
}

export function ClassSelector({ classes, selectedClass, onClassChange }: ClassSelectorProps) {
  return (
    <Select value={selectedClass ? String(selectedClass) : ''} onValueChange={v => onClassChange(Number(v))}>
      <SelectTrigger className="min-w-[140px]">
        <SelectValue placeholder="Seleccionar clase" />
      </SelectTrigger>
      <SelectContent>
        {classes.map(cls => (
          <SelectItem key={cls.id} value={String(cls.id)}>{cls.name} - {cls.schoolYear}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
