import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

export interface MonthYearPickerValue {
  month?: string
  year?: string
  isPresent?: boolean
}

export interface MonthYearPickerProps {
  value?: MonthYearPickerValue
  onChange: (val: MonthYearPickerValue) => void
  showPresentCheckbox?: boolean
  presentLabel?: string
  startYear?: number
  endYear?: number
  disabled?: boolean
}

export function MonthYearPicker({
  value = {},
  onChange,
  showPresentCheckbox = false,
  presentLabel = 'Present (Currently working here)',
  startYear = 1970,
  endYear = new Date().getFullYear() + 5,
  disabled = false,
}: MonthYearPickerProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => String(endYear - i)
  )

  const handleMonthChange = (month: string) => {
    onChange({
      ...value,
      month,
      year: value.year || String(currentYear),
      isPresent: false,
    })
  }

  const handleYearChange = (year: string) => {
    onChange({
      ...value,
      year,
      month: value.month || '01',
      isPresent: false,
    })
  }

  const handlePresentToggle = (checked: boolean) => {
    if (checked) {
      onChange({
        month: undefined,
        year: undefined,
        isPresent: true,
      })
    } else {
      onChange({
        month: '01',
        year: String(currentYear),
        isPresent: false,
      })
    }
  }

  const isPresent = Boolean(value.isPresent)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          disabled={disabled || isPresent}
          value={value.month || ''}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          disabled={disabled || isPresent}
          value={value.year || ''}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showPresentCheckbox && (
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="present-checkbox"
            checked={isPresent}
            onCheckedChange={handlePresentToggle}
            disabled={disabled}
          />
          <Label
            htmlFor="present-checkbox"
            className="text-xs font-normal text-muted-foreground cursor-pointer"
          >
            {presentLabel}
          </Label>
        </div>
      )}
    </div>
  )
}
