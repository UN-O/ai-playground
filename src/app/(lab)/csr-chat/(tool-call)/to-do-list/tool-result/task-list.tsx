'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, ChevronDown, ChevronUp, Clock, Play, Pause, RotateCcw, Plus, Trash, CheckCircle2, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'

type Condition = {
  condition: string
  status: string
}

type Subtask = {
  id: string
  name: string
  type: string
  status: 'pending' | 'completed'
}

type Task = {
  id: string
  title: string
  description: string
  priority: string
  duration: number
  conditions?: Condition[]
  subtasks?: Subtask[]
  completed?: boolean
}

type TaskListProps = {
  result: {
    tasks: Task[]
    notification: string
  }
}

const SubtaskItem = React.memo(({ subtask, onToggle, onDelete, onEdit }: { 
  subtask: Subtask
  onToggle: () => void
  onDelete: () => void 
  onEdit: (name: string) => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(subtask.name)

  const handleEdit = () => {
    onEdit(editedName)
    setIsEditing(false)
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex items-center space-x-2 py-1"
    >
      <Checkbox 
        id={subtask.id} 
        checked={subtask.status === 'completed'} 
        onCheckedChange={onToggle}
      />
      {isEditing ? (
        <Input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleEdit}
          onKeyPress={(e) => e.key === 'Enter' && handleEdit()}
          className="flex-grow"
        />
      ) : (
        <motion.label 
          htmlFor={subtask.id} 
          className={`flex-grow ${subtask.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
          onClick={() => setIsEditing(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {subtask.name}
        </motion.label>
      )}
      <Badge variant="outline">{subtask.type}</Badge>
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete subtask</span>
        </Button>
      </motion.div>
    </motion.li>
  )
})

const TaskItem = React.memo(({ task, onComplete, onDelete, onMove, index, totalTasks, onSelect, onUpdateTask }: {
  task: Task & { completed?: boolean }
  onComplete: () => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
  index: number
  totalTasks: number
  onSelect: () => void
  onUpdateTask: (updatedTask: any) => void
}) => {
  const [isExpanded, setIsExpanded] = useState(!task.completed)
  const [newSubtask, setNewSubtask] = useState('')

  const addSubtask = useCallback(() => {
    if (newSubtask.trim()) {
      const updatedTask = {
        ...task,
        subtasks: [
          ...(task.subtasks || []),
          { id: Date.now().toString(), name: newSubtask, type: 'custom', status: 'pending' }
        ]
      }
      onUpdateTask(updatedTask)
      setNewSubtask('')
    }
  }, [newSubtask, task, onUpdateTask])

  const toggleSubtask = useCallback((subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, status: st.status === 'completed' ? 'pending' : 'completed' } : st
    )
    onUpdateTask({ ...task, subtasks: updatedSubtasks })
  }, [task, onUpdateTask])

  const deleteSubtask = useCallback((subtaskId: string) => {
    const updatedSubtasks = task.subtasks?.filter(st => st.id !== subtaskId)
    onUpdateTask({ ...task, subtasks: updatedSubtasks })
  }, [task, onUpdateTask])

  const editSubtask = useCallback((subtaskId: string, newName: string) => {
    const updatedSubtasks = task.subtasks?.map(st =>
      st.id === subtaskId ? { ...st, name: newName } : st
    )
    onUpdateTask({ ...task, subtasks: updatedSubtasks })
  }, [task, onUpdateTask])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`transition-all duration-300 ${task.completed ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center justify-between">
            <span className={task.completed ? 'line-through' : ''}>{task.title}</span>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">{isExpanded ? 'Collapse' : 'Expand'}</span>
              </Button>
            </motion.div>
          </CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Badge variant={task.priority === 'high' ? 'destructive' : (task.priority === 'medium' ? 'default' : 'secondary')}>
              {task.priority}
            </Badge>
            <span>|</span>
            <Clock className="h-4 w-4" />
            <span>{task.duration} mins</span>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent>
                <p className="mb-4">{task.description}</p>
                <Separator className="my-4" />
                {task.conditions && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Conditions:</h4>
                    <div className="space-y-1">
                      {task.conditions.map((condition, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          {condition.status === '已完成' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>{condition.condition}</span>
                          <span className="text-sm text-muted-foreground">- {condition.status}</span>
                        </motion.li>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Subtasks:</h4>
                  <ScrollArea className="h-[200px] pr-4">
                    <AnimatePresence>
                      <div className="space-y-2">
                        {task.subtasks?.map((subtask) => (
                          <SubtaskItem
                            key={subtask.id}
                            subtask={subtask}
                            onToggle={() => toggleSubtask(subtask.id)}
                            onDelete={() => deleteSubtask(subtask.id)}
                            onEdit={(newName) => editSubtask(subtask.id, newName)}
                          />
                        ))}
                      </div>
                    </AnimatePresence>
                  </ScrollArea>
                  <div className="mt-2 flex space-x-2">
                    <Input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="New subtask"
                      className="flex-grow"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={addSubtask} size="icon">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add subtask</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={onComplete} variant={task.completed ? "outline" : "default"}>
                      {task.completed ? "Reopen" : "Complete"}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={onDelete} variant="destructive">
                      Delete
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={onSelect} variant="secondary">
                      Select
                    </Button>
                  </motion.div>
                </div>
                <div className="space-x-2 flex">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => onMove('up')}
                      disabled={index === 0}
                      variant="outline"
                      size="icon"
                    >
                      <ChevronUp className="h-4 w-4" />
                      <span className="sr-only">Move up</span>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={() => onMove('down')}
                      disabled={index === totalTasks - 1}
                      variant="outline"
                      size="icon"
                    >
                      <ChevronDown className="h-4 w-4" />
                      <span className="sr-only">Move down</span>
                    </Button>
                  </motion.div>
                </div>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
})

const Timer = React.memo(({ selectedTask, onTimerComplete }: { selectedTask: Task | null, onTimerComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(selectedTask ? selectedTask.duration * 60 : 0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (selectedTask) {
      setTimeLeft(selectedTask.duration * 60)
      setIsRunning(false)
    }
  }, [selectedTask])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false)
            onTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRunning, timeLeft, onTimerComplete])

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const resetTimer = useCallback(() => {
    if (selectedTask) {
      setTimeLeft(selectedTask.duration * 60)
      setIsRunning(false)
    }
  }, [selectedTask])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = selectedTask ? ((selectedTask.duration * 60 - timeLeft) / (selectedTask.duration * 60)) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              className="text-6xl font-bold tabular-nums"
              key={timeLeft}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {formatTime(timeLeft)}
            </motion.div>
            <Progress value={progress} className="w-full" />
            <div className="text-lg font-semibold">
              {selectedTask ? selectedTask.title : 'No task selected'}
            </div>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={toggleTimer} disabled={!selectedTask} size="lg">
                  {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={resetTimer} disabled={!selectedTask} variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

export default function TaskList({ result }) {
  const [tasks, setTasks] = useState(result.tasks.map(task => ({ ...task, completed: false })))
  const [notification, setNotification] = useState(result.notification)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const completeTask = useCallback((index: number) => {
    setTasks((prevTasks) => prevTasks.map((task, i) => 
      i === index ? { ...task, completed: !task.completed } : task
    ))
  }, [])

  const deleteTask = useCallback((index: number) => {
    setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index))
  }, [])

  const moveTask = useCallback((index: number, direction: 'up' | 'down') => {
    setTasks((prevTasks) => {
      const newTasks = [...prevTasks]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      const [movedTask] = newTasks.splice(index, 1)
      newTasks.splice(newIndex, 0, movedTask)
      return newTasks
    })
  }, [])

  const selectTask = useCallback((task: Task) => {
    setSelectedTask(task)
  }, [])

  const updateTask = useCallback((updatedTask: any) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
  }, [])

  const handleTimerComplete = useCallback(() => {
    if (selectedTask) {
      setTasks((prevTasks) => 
        prevTasks.map((task) =>
          task.id === selectedTask.id ? { ...task, completed: true } : task
        )
      )
      setSelectedTask(null)
    }
  }, [selectedTask])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert>
            <AlertTitle>Notification</AlertTitle>
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Timer selectedTask={selectedTask} onTimerComplete={handleTimerComplete} />

      <AnimatePresence>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={() => completeTask(index)}
            onDelete={() => deleteTask(index)}
            onMove={(direction) => moveTask(index, direction)}
            index={index}
            totalTasks={tasks.length}
            onSelect={() => selectTask(task)}
            onUpdateTask={updateTask}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

// const sampleTasks: Task[] = [
//   {
//     id: '1',
//     title: '完成專案報告',
//     description: '撰寫並提交第二季度的專案進度報告',
//     priority: 'high',
//     duration: 120,
//     conditions: [
//       { condition: '收集所有團隊成員的輸入', status: '已完成' },
//       { condition: '審核財務數據', status: '進行中' }
//     ],
//     subtasks: [
//       { id: 'st1', name: '撰寫執行摘要', type: '文書工作', status: 'pending' },
//       { id: 'st2', name: '製作數據圖表', type: '分析', status: 'completed' },
//       { id: 'st3', name: '校對文件', type: '審核', status: 'pending' }
//     ]
//   },
//   {
//     id: '2',
//     title: '準備客戶演示',
//     description: '為下週的客戶會議準備產品演示',
//     priority: 'medium',
//     duration: 90,
//     subtasks: [
//       { id: 'st4', name: '更新幻燈片', type: '設計', status: 'pending' },
//       { id: 'st5', name: '準備演示稿', type: '文書工作', status: 'pending' }
//     ]
//   },
//   {
//     id: '3',
//     title: '團隊建設活動',
//     description: '組織下個月的團隊建設活動',
//     priority: 'low',
//     duration: 60,
//     conditions: [
//       { condition: '確定日期', status: '已完成' },
//       { condition: '選擇活動地點', status: '待定' }
//     ]
//   }
// ]

// const sampleNotification = '請記得在本週五之前提交您的時間表。'

// export default function TaskManagementApp() {
//   return (
//     <div className="container mx-auto p-4">
//       <motion.h1 
//         className="text-3xl font-bold mb-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         任務管理應用
//       </motion.h1>
//       <TaskList result={{ tasks: sampleTasks, notification: sampleNotification }} />
//     </div>
//   )
// }