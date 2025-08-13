"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Check, X } from "lucide-react"

interface Goal {
  id: string
  title: string
  target: number
  current: number
  type: "workouts" | "meals" | "streak" | "consistency"
  timeframe: "weekly" | "monthly"
  completed: boolean
}

interface GoalTrackerProps {
  currentStats: {
    workouts: number
    meals: number
    streak: number
    consistency: number
  }
}

export function GoalTracker({ currentStats }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Weekly Workout Goal",
      target: 5,
      current: Math.min(currentStats.workouts, 5),
      type: "workouts",
      timeframe: "weekly",
      completed: currentStats.workouts >= 5,
    },
    {
      id: "2",
      title: "Monthly Meal Tracking",
      target: 60,
      current: Math.min(currentStats.meals, 60),
      type: "meals",
      timeframe: "monthly",
      completed: currentStats.meals >= 60,
    },
    {
      id: "3",
      title: "Consistency Target",
      target: 80,
      current: currentStats.consistency,
      type: "consistency",
      timeframe: "monthly",
      completed: currentStats.consistency >= 80,
    },
  ])

  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: "",
    type: "workouts" as Goal["type"],
    timeframe: "weekly" as Goal["timeframe"],
  })

  const handleAddGoal = () => {
    if (newGoal.title && newGoal.target) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        target: Number.parseInt(newGoal.target),
        current: 0,
        type: newGoal.type,
        timeframe: newGoal.timeframe,
        completed: false,
      }

      setGoals([...goals, goal])
      setNewGoal({ title: "", target: "", type: "workouts", timeframe: "weekly" })
      setIsAddingGoal(false)
    }
  }

  const removeGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <span>Goal Tracker</span>
            </CardTitle>
            <CardDescription>Set and track your fitness goals</CardDescription>
          </div>
          <Button
            onClick={() => setIsAddingGoal(true)}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Goals */}
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{goal.title}</h3>
                    <Badge variant={goal.completed ? "default" : "outline"}>{goal.timeframe}</Badge>
                    {goal.completed && (
                      <Badge className="bg-green-500 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {goal.current} / {goal.target}
                      {goal.type === "consistency" ? "%" : ""}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>

          {/* Add New Goal Form */}
          {isAddingGoal && (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4">
              <h3 className="font-medium">Add New Goal</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Weekly Workouts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-type">Type</Label>
                  <select
                    id="goal-type"
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as Goal["type"] })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="workouts">Workouts</option>
                    <option value="meals">Meals</option>
                    <option value="streak">Streak Days</option>
                    <option value="consistency">Consistency %</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal-timeframe">Timeframe</Label>
                  <select
                    id="goal-timeframe"
                    value={newGoal.timeframe}
                    onChange={(e) => setNewGoal({ ...newGoal, timeframe: e.target.value as Goal["timeframe"] })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddGoal} size="sm">
                  Add Goal
                </Button>
                <Button variant="outline" onClick={() => setIsAddingGoal(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {goals.length === 0 && !isAddingGoal && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No goals set yet. Add your first goal to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
