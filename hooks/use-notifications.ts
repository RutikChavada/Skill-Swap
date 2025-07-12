"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, type Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Notification {
  id: string
  userId: string
  message: string
  read: boolean
  timestamp: Timestamp
  type: string // e.g., 'swap_request', 'feedback', 'admin_message'
  // Add other fields as needed, e.g., relatedEntityId, relatedEntityType
}

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) {
      setNotifications([])
      setUnreadCount(0)
      console.log("useNotifications: No userId provided, skipping listener setup.")
      return
    }

    console.log(`useNotifications: Setting up real-time listener for user ${userId}`)
    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`useNotifications: Received snapshot with ${snapshot.docs.length} documents.`)
        const fetchedNotifications: Notification[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp, // Keep as Timestamp for now
        })) as Notification[]

        console.log("useNotifications: Fetched notifications:", fetchedNotifications)
        setNotifications(fetchedNotifications)
        setUnreadCount(fetchedNotifications.filter((n) => !n.read).length)
      },
      (error) => {
        console.error("useNotifications: Error listening to notifications:", error)
      },
    )

    return () => {
      console.log("useNotifications: Unsubscribing from real-time listener.")
      unsubscribe()
    }
  }, [userId])

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log(`markNotificationAsRead: Marking notification ${notificationId} as read.`)
      const notificationRef = doc(db, "notifications", notificationId)
      await updateDoc(notificationRef, {
        read: true,
      })
      console.log(`markNotificationAsRead: Notification ${notificationId} marked as read successfully.`)
    } catch (error) {
      console.error("markNotificationAsRead: Error marking notification as read:", error)
    }
  }, [])

  return { notifications, unreadCount, markNotificationAsRead }
}
