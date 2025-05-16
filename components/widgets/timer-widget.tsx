"use client"

import { useEffect, useState } from "react"
import { Pause, Play, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TimerWidget() {
  const [activeTab, setActiveTab] = useState("pomodoro")
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds

  useEffect(() => {
    // Set initial time based on active tab
    switch (activeTab) {
      case "pomodoro":
        setTime(25 * 60)
        break
      case "short":
        setTime(5 * 60)
        break
      case "long":
        setTime(15 * 60)
        break
    }
    setIsRunning(false)
  }, [activeTab])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    switch (activeTab) {
      case "pomodoro":
        setTime(25 * 60)
        break
      case "short":
        setTime(5 * 60)
        break
      case "long":
        setTime(15 * 60)
        break
    }
    setIsRunning(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pomodoro" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="short">Short Break</TabsTrigger>
            <TabsTrigger value="long">Long Break</TabsTrigger>
          </TabsList>
          <TabsContent value="pomodoro" className="mt-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-4">{formatTime(time)}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleTimer}>
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="short" className="mt-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-4">{formatTime(time)}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleTimer}>
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="long" className="mt-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-4">{formatTime(time)}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleTimer}>
                  {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
