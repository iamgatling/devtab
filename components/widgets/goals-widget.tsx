"use client"

import { useState, useEffect } from "react"
import { Check, Plus, X } from "lucide-react"
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"

interface Goal {
  id: string
  text: string
  completed: boolean
  userId: string
}

export function GoalsWidget() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const goalsRef = collection(db, "goals")
    const q = query(goalsRef, where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData: Goal[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        goalsData.push({
          id: doc.id,
          text: data.text,
          completed: data.completed,
          userId: data.userId,
        })
      })
      setGoals(goalsData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addGoal = async () => {
    if (!newGoal.trim() || !user) return

    try {
      await addDoc(collection(db, "goals"), {
        text: newGoal,
        completed: false,
        userId: user.uid,
        createdAt: new Date(),
      })
      setNewGoal("")
      setIsAdding(false)
    } catch (error) {
      console.error("Error adding goal:", error)
    }
  }

  const toggleGoal = async (id: string, currentStatus: boolean) => {
    try {
      const goalRef = doc(db, "goals", id)
      await updateDoc(goalRef, {
        completed: !currentStatus,
      })
    } catch (error) {
      console.error("Error toggling goal:", error)
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      await deleteDoc(doc(db, "goals", id))
    } catch (error) {
      console.error("Error deleting goal:", error)
    }
  }

  const completedPercentage =
    goals.length > 0 ? Math.round((goals.filter((goal) => goal.completed).length / goals.length) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-md font-medium">Daily Goals</CardTitle>
        {!isAdding && (
          <Button variant="ghost" size="icon" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add goal</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-2">
        {isAdding && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Add a new goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGoal()
              }}
            />
            <Button variant="outline" size="icon" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" onClick={addGoal}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{completedPercentage}%</span>
          </div>
          <Progress value={completedPercentage} />
        </div>

        <ScrollArea className="h-[180px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">No goals yet. Add your first goal!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={goal.completed ? "default" : "outline"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleGoal(goal.id, goal.completed)}
                    >
                      <Check className="h-3 w-3" />
                      <span className="sr-only">{goal.completed ? "Mark as incomplete" : "Mark as complete"}</span>
                    </Button>
                    <span className={`text-sm ${goal.completed ? "text-muted-foreground line-through" : ""}`}>
                      {goal.text}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteGoal(goal.id)}>
                    <X className="h-3 w-3" />
                    <span className="sr-only">Delete goal</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
