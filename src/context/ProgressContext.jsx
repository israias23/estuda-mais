// src/context/ProgressContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import {
  loadProgress,
  saveProgress,
  applyLessonComplete,
  recordAnswer as applyRecordAnswer,
  gradeReview as applyGradeReview,
} from '../services/progressService'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!user) {
      setProgress(null)
      setLoading(false)
      return
    }
    setLoading(true)
    loadProgress(user).then((p) => {
      if (active) {
        setProgress(p)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [user])

  // Atualiza e persiste o progresso de uma só vez.
  const update = useCallback(async (mutator) => {
    setProgress((prev) => {
      const next = typeof mutator === 'function' ? mutator(prev) : mutator
      saveProgress(next) // persiste em background
      return next
    })
  }, [])

  const completeLesson = useCallback(
    async (subjectId, lessonId, xpGain) => {
      let updated
      setProgress((prev) => {
        updated = applyLessonComplete(prev, subjectId, lessonId, xpGain)
        updated = { ...updated, lastSubjectId: subjectId }
        saveProgress(updated)
        return updated
      })
      return updated
    },
    []
  )

  const recordAnswer = useCallback(async (args) => {
    setProgress((prev) => {
      const next = applyRecordAnswer(prev, args)
      saveProgress(next)
      return next
    })
  }, [])

  const gradeReview = useCallback(async (key, ok) => {
    setProgress((prev) => {
      const next = applyGradeReview(prev, key, ok)
      saveProgress(next)
      return next
    })
  }, [])

  const value = { progress, loading, update, completeLesson, recordAnswer, gradeReview }
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress deve ser usado dentro de ProgressProvider')
  return ctx
}
