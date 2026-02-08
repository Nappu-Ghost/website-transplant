
"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    value?: string; // Format "HH:mm"
    onChange: (value: string) => void;
    hourStep?: number;
    minuteStep?: number;
    className?: string;
    id?: string;
}

const generateTimeOptions = (max: number, step: number, pad: boolean): string[] => {
    const options = [];
    for (let i = 0; i < max; i += step) {
        options.push(pad ? String(i).padStart(2, '0') : String(i));
    }
    return options;
};

export function TimePicker({
    value,
    onChange,
    hourStep = 1,
    minuteStep = 15,
    className,
    id
}: TimePickerProps) {
    const [hour, minute] = value ? value.split(':') : ["", ""];

    const hours = React.useMemo(() => generateTimeOptions(24, hourStep, true), [hourStep]);
    const minutes = React.useMemo(() => generateTimeOptions(60, minuteStep, true), [minuteStep]);

    const handleHourChange = (newHour: string) => {
        onChange(`${newHour}:${minute || '00'}`);
    };

    const handleMinuteChange = (newMinute: string) => {
        onChange(`${hour || '00'}:${newMinute}`);
    };

    return (
        <div className={cn("flex items-center gap-2", className)} id={id}>
            <div className="flex-1">
                <Label htmlFor={`${id}-hour`} className="sr-only">Hour</Label>
                <Select value={hour} onValueChange={handleHourChange}>
                    <SelectTrigger id={`${id}-hour`}>
                        <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent>
                        {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <span>:</span>
            <div className="flex-1">
                 <Label htmlFor={`${id}-minute`} className="sr-only">Minute</Label>
                <Select value={minute} onValueChange={handleMinuteChange}>
                    <SelectTrigger id={`${id}-minute`}>
                        <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                        {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

    