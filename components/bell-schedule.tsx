"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, ChevronDown, ChevronUp, Sun, Moon, Settings, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Period {
  name: string
  startTime: string // 24h "HH:MM"
  endTime: string   // 24h "HH:MM"
}

interface Schedule {
  [key: string]: Period[]
}

interface DepartmentSchedule {
  [key: string]: string[]
}

/** ---------- SCHEDULE DATA (24-hour internally) ---------- */
const schedules: Schedule = {
  monday: [
    { name: "Period 1", startTime: "08:00", endTime: "08:50" },
    { name: "MM/SOAR", startTime: "08:55", endTime: "09:10" },
    { name: "Period 2", startTime: "09:15", endTime: "10:05" },
    { name: "Period 3", startTime: "10:10", endTime: "11:00" },
    { name: "Period 4", startTime: "11:05", endTime: "12:30" },
    { name: "Period 5", startTime: "12:35", endTime: "13:25" },
    { name: "Period 6", startTime: "13:30", endTime: "14:20" },
    { name: "Period 7", startTime: "14:25", endTime: "15:15" },
  ],
  tuesday: [
    { name: "Period 1", startTime: "08:00", endTime: "08:55" },
    { name: "Period 2", startTime: "09:00", endTime: "09:55" },
    { name: "Period 3", startTime: "10:00", endTime: "10:55" },
    { name: "Period 4", startTime: "11:00", endTime: "12:15" },
    { name: "Period 5", startTime: "12:20", endTime: "13:15" },
    { name: "Period 6", startTime: "13:20", endTime: "14:15" },
    { name: "Period 7", startTime: "14:20", endTime: "15:15" },
  ],
  wednesday: [
    { name: "Period 1", startTime: "08:00", endTime: "08:50" },
    { name: "SOAR", startTime: "08:55", endTime: "09:10" },
    { name: "Period 2", startTime: "09:15", endTime: "10:05" },
    { name: "Period 3", startTime: "10:10", endTime: "11:00" },
    { name: "Period 4", startTime: "11:05", endTime: "12:30" },
    { name: "Period 5", startTime: "12:35", endTime: "13:25" },
    { name: "Period 6", startTime: "13:30", endTime: "14:20" },
    { name: "Period 7", startTime: "14:25", endTime: "15:15" },
  ],
  thursday: [
    { name: "Period 1", startTime: "08:00", endTime: "08:55" },
    { name: "Period 2", startTime: "09:00", endTime: "09:55" },
    { name: "Period 3", startTime: "10:00", endTime: "10:55" },
    { name: "Period 4", startTime: "11:00", endTime: "12:15" },
    { name: "Period 5", startTime: "12:20", endTime: "13:15" },
    { name: "Period 6", startTime: "13:20", endTime: "14:15" },
    { name: "Period 7", startTime: "14:20", endTime: "15:15" },
  ],
  friday: [
    { name: "Period 1", startTime: "08:00", endTime: "08:50" },
    { name: "Period 2", startTime: "08:55", endTime: "09:45" },
    { name: "Period 3", startTime: "09:50", endTime: "10:40" },
    { name: "Period 4", startTime: "10:45", endTime: "11:35" },
    { name: "Period 5", startTime: "11:40", endTime: "13:00" },
  ],
}

const departmentSchedule: DepartmentSchedule = {
  "Period 1": ["LANGUAGE", "LANGUAGE", "LANGUAGE", "------", "------"],
  "Period 2": ["------", "------", "SOCIAL SCIENCE", "SOCIAL SCIENCE", "SOCIAL SCIENCE"],
  "Period 3": ["------", "------", "MATH", "MATH", "MATH"],
  "Period 4": ["CYBER", "CYBER", "------", "------", "CYBER"],
  "Period 5": ["ENGINEERING", "ENGINEERING", "------", "ENGINEERING", "ENGINEERING"],
  "Period 6": ["SCIENCE", "SCIENCE", "SCIENCE", "SCIENCE", "------"],
  "Period 7": ["------", "------", "------", "------", "------"],
}

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

/** ---------- HELPERS ---------- */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}
function formatHM12(hhmm: string) {
  const [H, M] = hhmm.split(":").map(Number)
  const hour12 = ((H + 11) % 12) + 1
  const ampm = H >= 12 ? "PM" : "AM"
  return `${hour12}:${String(M).padStart(2, "0")} ${ampm}`
}
function getCurrentPeriod(daySchedule: Period[], currentTime: string) {
  const currentMinutes = timeToMinutes(currentTime)
  for (let i = 0; i < daySchedule.length; i++) {
    const period = daySchedule[i]
    const startMinutes = timeToMinutes(period.startTime)
    const endMinutes = timeToMinutes(period.endTime)
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return {
        current: period,
        next: daySchedule[i + 1] || null,
        timeUntilEnd: endMinutes - currentMinutes,
        isActive: true,
      }
    }
  }
  // between periods
  for (let i = 0; i < daySchedule.length - 1; i++) {
    const currentPeriod = daySchedule[i]
    const nextPeriod = daySchedule[i + 1]
    const currentEndMinutes = timeToMinutes(currentPeriod.endTime)
    const nextStartMinutes = timeToMinutes(nextPeriod.startTime)
    if (currentMinutes >= currentEndMinutes && currentMinutes < nextStartMinutes) {
      return {
        current: null,
        next: nextPeriod,
        timeUntilEnd: nextStartMinutes - currentMinutes,
        isActive: false,
      }
    }
  }
  return { current: null, next: null, timeUntilEnd: 0, isActive: false }
}

/** ====================================================================== */

export default function BellSchedule() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [hasNotified5Min, setHasNotified5Min] = useState(false)
  const [hasNotifiedEnd, setHasNotifiedEnd] = useState(false)
  const [lastPeriod, setLastPeriod] = useState<string | null>(null)
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true)
  const [isDeptScheduleExpanded, setIsDeptScheduleExpanded] = useState(false)
  const [isDetailedScheduleExpanded, setIsDetailedScheduleExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [scheduleOverride, setScheduleOverride] = useState<string | null>(null)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  /** ---------- AUDIO: mp3 + unlock + test ---------- */
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [assetVersion, setAssetVersion] = useState(() => Date.now()) // cache-buster if you swap /public/bell.mp3
  const timerRef = useRef<number | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const a = new Audio(`/bell.mp3?v=${assetVersion}`)
    a.preload = "auto"
    a.loop = false
    audioRef.current = a
    return () => {
      audioRef.current = null
    }
  }, [assetVersion])

  const enableAudio = useCallback(async () => {
    try {
      const a = audioRef.current
      if (!a) return
      a.muted = true
      await a.play()
      a.pause()
      a.muted = false
      setSoundEnabled(true)
      toast({ title: "🔊 Bell sound enabled", description: "Scheduled bells will now play." })
    } catch {
      toast({ title: "Allow sound", description: "Click again if your browser blocked audio." })
    }
  }, [toast])

  const playBell = useCallback(async () => {
    const a = audioRef.current
    if (!a) return
    try {
      a.currentTime = 0
      await a.play()
    } catch {
      // Fallback beep via WebAudio if direct play fails
      try {
        const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
        if (!Ctx) return
        const ctx = new Ctx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = 1000
        gain.gain.value = 0.06
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        setTimeout(() => {
          osc.stop()
          ctx.close()
        }, 300)
      } catch {}
    }
  }, [])

  /** ---------- CLOCK TICK ---------- */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const actualDayName = currentTime.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
  const dayName = scheduleOverride || actualDayName
  const daySchedule = schedules[dayName] || []
  const currentTimeString = currentTime.toTimeString().slice(0, 5)
  const periodInfo = getCurrentPeriod(daySchedule, currentTimeString)

  /** ---------- RESET FLAGS WHEN PERIOD CHANGES ---------- */
  useEffect(() => {
    const currentPeriodName = periodInfo.current?.name || "break"
    if (lastPeriod !== currentPeriodName) {
      setHasNotified5Min(false)
      setHasNotifiedEnd(false)
      setLastPeriod(currentPeriodName)
    }
  }, [periodInfo.current?.name, lastPeriod])

  /** ---------- YOUR EXISTING END-OF-PERIOD ALERTS ---------- */
  useEffect(() => {
    if (periodInfo.isActive && periodInfo.current) {
      // 5 minutes remaining (before END)
      if (periodInfo.timeUntilEnd === 5 && !hasNotified5Min) {
        setHasNotified5Min(true)
        toast({
          title: "⏰ 5 Minutes Remaining",
          description: `${periodInfo.current.name} ends in 5 minutes`,
        })
        if (soundEnabled) void playBell()
      }
      // period ended
      if (periodInfo.timeUntilEnd === 0 && !hasNotifiedEnd) {
        setHasNotifiedEnd(true)
        toast({
          title: "🔔 Period Ended",
          description: `${periodInfo.current.name} has ended`,
        })
        if (soundEnabled) void playBell()
      }
    }
  }, [periodInfo, hasNotified5Min, hasNotifiedEnd, toast, soundEnabled, playBell])

  /** ---------- START-OF-PERIOD + 5-MINUTES-BEFORE START SCHEDULER ---------- */
  const PREBELL_MIN = 5

  const parseHM = (s: string) => {
    const [H, M] = s.split(":").map(Number)
    return { H, M }
  }
  const mkDate = (H: number, M: number, dayOffset = 0) => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    d.setHours(H, M, 0, 0)
    return d
  }
  const buildEventsForDay = (schedule: Period[], dayOffset: number) => {
    const events: { at: Date; label: string; period: string; startHM: string }[] = []
    for (const p of schedule) {
      const { H, M } = parseHM(p.startTime)
      const startAt = mkDate(H, M, dayOffset)
      events.push({ at: startAt, label: "Start", period: p.name, startHM: p.startTime })
      const pre = new Date(startAt.getTime() - PREBELL_MIN * 60_000)
      if (pre.getDate() === startAt.getDate()) {
        events.push({ at: pre, label: "Prebell", period: p.name, startHM: p.startTime })
      }
    }
    events.sort((a, b) => a.at.getTime() - b.at.getTime())
    return events
  }
  const getNextEvent = (schedule: Period[]) => {
    const now = Date.now()
    let events = buildEventsForDay(schedule, 0)
    let next = events.find(e => e.at.getTime() > now)
    if (!next) {
      events = buildEventsForDay(schedule, 1)
      next = events[0]
    }
    return next
  }

  const scheduleNext = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const next = getNextEvent(daySchedule)
    if (!next) return
    const ms = Math.max(0, next.at.getTime() - Date.now())
    timerRef.current = window.setTimeout(async () => {
      if (soundEnabled) await playBell()
      if (next.label === "Prebell") {
        toast({
          title: "🔔 5-Minute Warning",
          description: `${next.period} starts at ${formatHM12(next.startHM)}`,
        })
      } else {
        toast({
          title: "🔔 Period Start",
          description: `${next.period} begins now (${formatHM12(next.startHM)})`,
        })
      }
      scheduleNext()
    }, ms) as unknown as number
  }, [daySchedule, soundEnabled, playBell, toast])

  useEffect(() => {
    scheduleNext()
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [scheduleNext, scheduleOverride])

  /** ---------- ADMIN / OVERRIDE ---------- */
  const handleScheduleOverride = (newSchedule: string) => {
    if (newSchedule === "default") {
      setScheduleOverride(null)
      toast({ title: "Schedule Reset", description: "Using default daily schedule" })
    } else {
      setScheduleOverride(newSchedule)
      toast({
        title: "Schedule Override Set",
        description: `Now using ${newSchedule.charAt(0).toUpperCase() + newSchedule.slice(1)} schedule`,
      })
    }
    setIsAdminOpen(false)
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="h-screen flex flex-col p-4">
        {/* Header */}
        <div className="text-center mb-4 relative flex-shrink-0">
          <div className="absolute top-0 right-0 flex gap-2">
            {/* Enable/Test Bell */}
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent border-none"
              onClick={soundEnabled ? playBell : enableAudio}
              title={soundEnabled ? "Test bell" : "Enable bell sound"}
            >
              <Bell className="h-4 w-4 text-white" />
            </Button>

            <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-transparent border-none">
                  <Settings className="h-4 w-4 text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Admin Controls
                  </DialogTitle>
                  <DialogDescription>Override the daily schedule for special circumstances</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Schedule Override</label>
                    <Select onValueChange={handleScheduleOverride} value={scheduleOverride || "default"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule to use" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (Today's Schedule)</SelectItem>
                        <SelectItem value="monday">Monday Schedule</SelectItem>
                        <SelectItem value="tuesday">Tuesday Schedule</SelectItem>
                        <SelectItem value="wednesday">Wednesday Schedule</SelectItem>
                        <SelectItem value="thursday">Thursday Schedule</SelectItem>
                        <SelectItem value="friday">Friday Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {scheduleOverride && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Active Override:</strong> Using{" "}
                        {scheduleOverride.charAt(0).toUpperCase() + scheduleOverride.slice(1)} schedule instead of{" "}
                        {actualDayName.charAt(0).toUpperCase() + actualDayName.slice(1)}
                      </p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="icon"
              className="bg-transparent border-none"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 text-white rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 text-white rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-center gap-4 mb-2">
              <Image
                src="/images/ascte-logo.png"
                alt="Alabama School of Cyber Technology and Engineering"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-mono font-bold">ASCTE Bell Schedule</h1>
                <p className="text-blue-100 font-mono font-medium text-sm">
                  Alabama School of Cyber Technology & Engineering
                </p>
              </div>
            </div>
            <p className="text-blue-200 text-xs font-mono">2025-2026 Academic Year</p>
            {scheduleOverride && (
              <div className="mt-2 inline-flex items-center gap-2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                <Settings className="h-4 w-4" />
                Override Active: {scheduleOverride.charAt(0).toUpperCase() + scheduleOverride.slice(1)} Schedule
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="order-2 xl:order-1">
            <Card className="shadow-lg h-full">
              <CardHeader className="pb-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                  onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
                >
                  <CardTitle className="flex items-center gap-3 text-lg font-mono">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Today's Schedule - {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                  </CardTitle>
                  {isScheduleExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CardHeader>
              {isScheduleExpanded && (
                <CardContent className="text-center flex items-center justify-center h-full py-8">
                  <div className="space-y-6">
                    {(() => {
                      const currentMinutes = timeToMinutes(currentTimeString)
                      const schoolEndTime = timeToMinutes("15:15")
                      if (currentMinutes > schoolEndTime) {
                        return (
                          <>
                            <h2 className="text-[14rem] leading-none font-mono font-black text-gray-900 dark:text-white">
                              CLASS OVER
                            </h2>
                            <p className="text-9xl font-mono font-bold text-gray-700 dark:text-gray-300">
                              School Day Complete
                            </p>
                          </>
                        )
                      } else if (periodInfo.current) {
                        return (
                          <>
                            <h2 className="text-[14rem] leading-none font-mono font-black text-gray-900 dark:text-white">
                              {periodInfo.current.name.toUpperCase()}
                            </h2>
                            <p className="text-9xl font-mono font-bold text-gray-700 dark:text-gray-300">
                              {formatHM12(periodInfo.current.startTime)} - {formatHM12(periodInfo.current.endTime)}
                            </p>
                          </>
                        )
                      } else if (periodInfo.next) {
                        return (
                          <>
                            <h2 className="text-[14rem] leading-none font-mono font-black text-gray-900 dark:text-white">
                              BREAK TIME
                            </h2>
                            <p className="text-9xl font-mono font-bold text-gray-700 dark:text-gray-300">
                              Next: {periodInfo.next.name} at {formatHM12(periodInfo.next.startTime)}
                            </p>
                          </>
                        )
                      } else {
                        return (
                          <>
                            <h2 className="text-[14rem] leading-none font-mono font-black text-gray-900 dark:text-white">
                              NO CLASSES
                            </h2>
                            <p className="text-9xl font-mono font-bold text-gray-700 dark:text-gray-300">
                              Enjoy Your Day!
                            </p>
                          </>
                        )
                      }
                    })()}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="order-1 xl:order-2">
            <Card className="shadow-lg h-full">
              <CardHeader className="bg-red-600 text-white rounded-t-lg pb-2">
                <CardTitle className="flex items-center gap-3 text-lg font-mono">
                  <Clock className="h-5 w-5" />
                  Live Status Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-full">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  <div className="flex items-center gap-4 p-6 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <Calendar className="h-12 w-12 text-blue-600" />
                    <div>
                      <p className="text-2xl text-gray-600 dark:text-gray-400 font-mono">Date</p>
                      <p className="font-mono font-semibold text-4xl text-gray-900 dark:text-white">
                        {formatDate(currentTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <Clock className="h-12 w-12 text-red-600" />
                    <div>
                      <p className="text-2xl text-gray-600 dark:text-gray-400 font-mono">Current Time</p>
                      <p className="font-mono font-semibold text-6xl text-gray-900 dark:text-white">
                        {formatTime(currentTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-6 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-blue-600"></div>
                    <div>
                      <p className="text-2xl text-gray-600 dark:text-gray-400 font-mono">Current Period</p>
                      {periodInfo.isActive && periodInfo.current ? (
                        <Badge className="bg-green-600 hover:bg-green-700 text-white text-2xl px-6 py-3">
                          {periodInfo.current.name}
                        </Badge>
                      ) : periodInfo.next ? (
                        <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white text-2xl px-6 py-3">
                          Break - Next: {periodInfo.next.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-2xl px-6 py-3">
                          No Classes Today
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {periodInfo.isActive && periodInfo.current && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-bold text-green-800 dark:text-green-300 mb-4 text-3xl">
                      📚 Currently In Session
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 text-2xl">
                      <span className="font-semibold">{periodInfo.current.name}</span> •{" "}
                      {formatHM12(periodInfo.current.startTime)} - {formatHM12(periodInfo.current.endTime)}
                    </p>
                    <p className="text-4xl font-bold text-green-800 dark:text-green-300">
                      ⏱️ {Math.floor(periodInfo.timeUntilEnd / 60)}h {periodInfo.timeUntilEnd % 60}m remaining
                    </p>
                  </div>
                )}

                {!periodInfo.isActive && periodInfo.next && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-4 text-3xl">⏸️ Break Time</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 text-2xl">
                      Next: <span className="font-semibold">{periodInfo.next.name}</span> starts at{" "}
                      {formatHM12(periodInfo.next.startTime)}
                    </p>
                    <p className="text-4xl font-bold text-yellow-800 dark:text-yellow-300">
                      🕐 {Math.floor(periodInfo.timeUntilEnd / 60)}h {periodInfo.timeUntilEnd % 60}m until next period
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-4 space-y-2 flex-shrink-0">
          {/* Detailed Schedule */}
          {daySchedule.length > 0 ? (
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                  onClick={() => setIsDetailedScheduleExpanded(!isDetailedScheduleExpanded)}
                >
                  <CardTitle className="flex items-center gap-3 text-base font-mono">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {scheduleOverride ? (
                      <>{scheduleOverride.charAt(0).toUpperCase() + scheduleOverride.slice(1)} Schedule (Override)</>
                    ) : (
                      <>Detailed Schedule - {dayName.charAt(0).toUpperCase() + dayName.slice(1)}</>
                    )}
                  </CardTitle>
                  {isDetailedScheduleExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </CardHeader>
              {isDetailedScheduleExpanded && (
                <CardContent className="pt-0">
                  <div className="grid gap-2">
                    {daySchedule.map((period, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                          periodInfo.current?.name === period.name
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500 shadow-md"
                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-600 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              periodInfo.current?.name === period.name ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          <div>
                            <span className="font-mono font-bold text-base">{period.name}</span>
                            {periodInfo.current?.name === period.name && (
                              <span className="ml-2 text-xs font-medium text-green-600 font-mono">• ACTIVE</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-base font-semibold">
                            {formatHM12(period.startTime)} - {formatHM12(period.endTime)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-lg font-bold mb-1">No Classes Today!</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Enjoy your {dayName.charAt(0).toUpperCase() + dayName.slice(1)}!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Dept Schedule */}
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto"
                onClick={() => setIsDeptScheduleExpanded(!isDeptScheduleExpanded)}
              >
                <CardTitle className="flex items-center gap-3 text-base font-mono">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  2025-2026 Dept Schedule
                </CardTitle>
                {isDeptScheduleExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </CardHeader>
            {isDeptScheduleExpanded && (
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-2 border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-slate-700 font-bold text-left text-sm">
                          Period
                        </th>
                        {dayLabels.map((day) => (
                          <th
                            key={day}
                            className="border-2 border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-slate-700 font-bold text-center text-sm"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(departmentSchedule).map(([period, subjects]) => (
                        <tr key={period}>
                          <td className="border-2 border-gray-300 dark:border-gray-600 p-2 font-semibold bg-gray-50 dark:bg-slate-800 text-sm">
                            {period}
                          </td>
                          {subjects.map((subject, index) => (
                            <td
                              key={index}
                              className="border-2 border-gray-300 dark:border-gray-600 p-2 text-center bg-white dark:bg-slate-800"
                            >
                              <span
                                className={`font-medium text-xs ${subject === "------" ? "text-gray-400" : "text-gray-900 dark:text-white"}`}
                              >
                                {subject}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
