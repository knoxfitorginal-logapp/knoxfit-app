"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { DateRange } from "react-day-picker"

interface ExportDataProps {
  data: any
  dateRange: DateRange | undefined
  userEmail: string
}

export function ExportData({ data, dateRange, userEmail }: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Create CSV content
      const csvContent = generateCSV(data, dateRange)

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute("download", `knoxfit-analytics-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Your analytics data has been downloaded as CSV.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSV = (data: any, dateRange: DateRange | undefined) => {
    const headers = ["Date", "Workouts", "Meals", "Total", "Streak"]
    const rows = data.activityData.map((item: any, index: number) => [
      item.date,
      item.workouts,
      item.meals,
      item.total,
      data.streakData[index]?.streak || 0,
    ])

    const csvContent = [headers.join(","), ...rows.map((row: any[]) => row.join(","))].join("\n")

    return csvContent
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="hover:bg-blue-50 bg-transparent"
    >
      <Download className={`h-4 w-4 mr-2 ${isExporting ? "animate-spin" : ""}`} />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  )
}
