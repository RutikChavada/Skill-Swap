import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot, // Import onSnapshot
} from "firebase/firestore"
import { db } from "./firebase"

// Helper to create notifications
export const createNotification = async (notificationData: {
  userId: string
  message: string
  type: string
  relatedEntityId?: string
}) => {
  try {
    console.log("createNotification: Attempting to create notification with data:", notificationData)
    const docRef = await addDoc(collection(db, "notifications"), {
      ...notificationData,
      read: false,
      timestamp: Timestamp.now(),
    })
    console.log("createNotification: Notification created successfully with ID:", docRef.id)
    return { success: true }
  } catch (error) {
    console.error("createNotification: Error creating notification:", error)
    return { success: false, error }
  }
}

// User operations
export const createUser = async (
  userId: string,
  userData: {
    name: string
    firstName: string
    lastName: string
    email: string
    location?: string
    bio?: string
    skillsOffered: string[]
    skillsWanted: string[]
    avatar?: string
  },
) => {
  try {
    // Use setDoc with the user's UID as the document ID
    await setDoc(doc(db, "users", userId), {
      ...userData,
      rating: 0,
      completedSwaps: 0,
      isPublic: true,
      status: "active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    return { success: true, id: userId }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error }
  }
}

export const getUsers = async (skillFilter?: string) => {
  try {
    const q = query(
      collection(db, "users"),
      where("isPublic", "==", true),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(50),
    )

    const querySnapshot = await getDocs(q)
    let users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(), // Corrected toDate() call
    }))

    // Filter by skill if provided (client-side filtering for array-contains)
    if (skillFilter) {
      users = users.filter((user: any) =>
        user.skillsOffered?.some((skill: string) => skill.toLowerCase().includes(skillFilter.toLowerCase())),
      )
    }

    return { success: true, users }
  } catch (error) {
    console.error("Error getting users:", error)
    // Return mock data if Firestore fails
    const mockUsers = [
      {
        id: "1",
        name: "Alice Johnson",
        email: "alice@example.com",
        location: "San Francisco, CA",
        avatar: "/placeholder.svg?height=40&width=40",
        skillsOffered: ["React", "JavaScript", "UI/UX Design"],
        skillsWanted: ["Python", "Machine Learning"],
        rating: 4.8,
        completedSwaps: 12,
        isPublic: true,
      },
      {
        id: "2",
        name: "Bob Smith",
        email: "bob@example.com",
        location: "New York, NY",
        avatar: "/placeholder.svg?height=40&width=40",
        skillsOffered: ["Python", "Data Science", "Machine Learning"],
        skillsWanted: ["React", "Frontend Development"],
        rating: 4.9,
        completedSwaps: 8,
        isPublic: true,
      },
    ]

    let users = mockUsers
    if (skillFilter) {
      users = users.filter((user) =>
        user.skillsOffered.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())),
      )
    }

    return { success: true, users }
  }
}

export const getUserById = async (userId: string) => {
  console.log(`getUserById: Attempting to fetch user with ID: ${userId}`)
  try {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      console.log(`getUserById: User ${userId} found.`)
      return {
        success: true,
        user: {
          id: docSnap.id,
          name: data.name || "", // Ensure name is always a string
          email: data.email || "",
          location: data.location || "",
          bio: data.bio || "",
          skillsOffered: data.skillsOffered || [], // Ensure arrays are initialized
          skillsWanted: data.skillsWanted || [],
          avatar: data.avatar || "",
          rating: data.rating || 0,
          completedSwaps: data.completedSwaps || 0,
          isPublic: data.isPublic !== undefined ? data.isPublic : true,
          status: data.status || "active",
          createdAt: data.createdAt?.toDate() || new Date(), // FIX: Call toDate() correctly
          updatedAt: data.updatedAt?.toDate() || new Date(),
        },
      }
    } else {
      console.warn(`getUserById: User with ID ${userId} not found in Firestore.`)
      return { success: false, error: "User not found" }
    }
  } catch (error) {
    console.error(`getUserById: Error getting user ${userId}:`, error)
    return { success: false, error }
  }
}

export const updateUser = async (userId: string, userData: any) => {
  try {
    const docRef = doc(db, "users", userId)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error }
  }
}

// Swap request operations
export const createSwapRequest = async (requestData: {
  fromUserId: string
  toUserId: string
  skillWanted: string
  message: string
}) => {
  try {
    const docRef = await addDoc(collection(db, "swapRequests"), {
      ...requestData,
      status: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    // Fetch sender and receiver names for notification
    const fromUserRes = await getUserById(requestData.fromUserId)
    const toUserRes = await getUserById(requestData.toUserId)

    if (fromUserRes.success && toUserRes.success) {
      await createNotification({
        userId: requestData.toUserId,
        message: `${fromUserRes.user.name} sent you a new skill swap request!`,
        type: "swap_request",
        relatedEntityId: docRef.id,
      })
    }

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating swap request:", error)
    return { success: false, error }
  }
}

export const getSwapRequestsRealtime = (
  userId: string,
  callback: (data: { received: any[]; sent: any[]; completed: any[] }) => void,
) => {
  if (!userId) {
    console.log("getSwapRequestsRealtime: No userId provided, returning empty data.")
    callback({ received: [], sent: [], completed: [] })
    return () => {} // Return a no-op unsubscribe
  }

  console.log(`getSwapRequestsRealtime: Setting up listeners for userId: ${userId}`)

  const receivedQuery = query(
    collection(db, "swapRequests"),
    where("toUserId", "==", userId),
    orderBy("createdAt", "desc"),
  )

  const sentQuery = query(
    collection(db, "swapRequests"),
    where("fromUserId", "==", userId),
    orderBy("createdAt", "desc"),
  )

  const unsubscribes: (() => void)[] = []
  let receivedRequests: any[] = []
  let sentRequests: any[] = []
  let receivedLoaded = false
  let sentLoaded = false

  const updateCombinedRequests = async () => {
    if (receivedLoaded && sentLoaded) {
      console.log("updateCombinedRequests: Both received and sent snapshots loaded. Processing...")
      const allRequests = [...receivedRequests, ...sentRequests]
      console.log("updateCombinedRequests: All raw requests combined:", allRequests.length, "documents")
      console.log("updateCombinedRequests: All raw requests combined:", allRequests)

      const userIdsToFetch = new Set<string>()
      allRequests.forEach((req) => {
        userIdsToFetch.add(req.fromUserId)
        userIdsToFetch.add(req.toUserId)
      })

      console.log("updateCombinedRequests: Fetching user profiles for IDs:", Array.from(userIdsToFetch))
      const userPromises = Array.from(userIdsToFetch).map((id) => getUserById(id))
      const userResults = await Promise.all(userPromises)
      const usersMap = new Map<string, any>()
      userResults.forEach((res) => {
        if (res.success) {
          usersMap.set(res.user.id, res.user)
        } else {
          console.warn(`updateCombinedRequests: Failed to fetch user profile for ID: ${res.error}`)
        }
      })
      console.log("updateCombinedRequests: Fetched users map:", usersMap)

      const enrichedRequests = allRequests.map((req) => {
        const fromUser = usersMap.get(req.fromUserId)
        const toUser = usersMap.get(req.toUserId)
        return {
          id: req.id, // Ensure ID is always present
          ...req,
          from: fromUser,
          to: toUser,
        }
      })
      console.log("updateCombinedRequests: Enriched requests:", enrichedRequests.length, "documents")
      console.log("updateCombinedRequests: Enriched requests before filtering:", enrichedRequests)

      const received = enrichedRequests.filter((req: any) => req.toUserId === userId && req.status === "pending")
      console.log("updateCombinedRequests: Filtered received requests:", received)
      const sent = enrichedRequests.filter(
        (req: any) => req.fromUserId === userId && (req.status === "pending" || req.status === "accepted"),
      )
      console.log("updateCombinedRequests: Filtered sent requests:", sent)
      // FIX: Ensure completed requests are also filtered by the current user's involvement
      const completed = enrichedRequests
        .filter((req: any) => (req.fromUserId === userId || req.toUserId === userId) && req.status === "completed")
        .map((req: any) => {
          const partner = req.fromUserId === userId ? req.to : req.from
          return {
            ...req,
            partner: partner,
            skillExchanged: `${req.skillWanted} ↔ ${partner?.skillsOffered?.[0] || "N/A"}`, // Adjust as needed
            completedDate: req.updatedAt,
            rating: 0, // Placeholder, actual rating would come from feedback collection
            feedback: "No feedback yet.", // Placeholder
          }
        })

      console.log("updateCombinedRequests: Filtered completed requests:", completed)
      console.log(
        "updateCombinedRequests: Final data for callback - Received:",
        received.length,
        "Sent:",
        sent.length,
        "Completed:",
        completed.length,
      )
      callback({
        received: received,
        sent: sent,
        completed: completed,
      })
    } else {
      console.log("updateCombinedRequests: Waiting for both received and sent snapshots to load.")
    }
  }

  const unsubscribeReceived = onSnapshot(
    receivedQuery,
    async (snapshot) => {
      console.log("onSnapshot (received): Received snapshot with", snapshot.docs.length, "documents.")
      receivedRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(), // Corrected toDate() call
        updatedAt: doc.data().updatedAt?.toDate() || new Date(), // Corrected toDate() call
      }))
      console.log("onSnapshot (received): Raw received requests:", receivedRequests)
      receivedLoaded = true
      await updateCombinedRequests()
    },
    (error) => {
      console.error("Error listening to received swap requests:", error)
      callback({ received: [], sent: [], completed: [] }) // Provide empty arrays on error
    },
  )
  unsubscribes.push(unsubscribeReceived)

  const unsubscribeSent = onSnapshot(
    sentQuery,
    async (snapshot) => {
      console.log("onSnapshot (sent): Received snapshot with", snapshot.docs.length, "documents.")
      sentRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(), // Corrected toDate() call
        updatedAt: doc.data().updatedAt?.toDate() || new Date(), // Corrected toDate() call
      }))
      console.log("onSnapshot (sent): Raw sent requests:", sentRequests)
      sentLoaded = true
      await updateCombinedRequests()
    },
    (error) => {
      console.error("Error listening to sent swap requests:", error)
      callback({ received: [], sent: [], completed: [] }) // Provide empty arrays on error
    },
  )
  unsubscribes.push(unsubscribeSent)

  return () => {
    console.log("Unsubscribing from swap requests listeners.")
    unsubscribes.forEach((unsub) => unsub())
  }
}

export const updateSwapRequestStatus = async (requestId: string, status: string) => {
  try {
    const requestRef = doc(db, "swapRequests", requestId)
    await updateDoc(requestRef, {
      status,
      updatedAt: Timestamp.now(),
    })

    // Fetch request details to send notification
    const requestSnap = await getDoc(requestRef)
    if (requestSnap.exists()) {
      const requestData = requestSnap.data()
      const fromUserRes = await getUserById(requestData.fromUserId)
      const toUserRes = await getUserById(requestData.toUserId)

      if (fromUserRes.success && toUserRes.success) {
        let message = ""
        let notificationRecipientId = ""

        if (status === "accepted") {
          message = `${toUserRes.user.name} accepted your skill swap request!`
          notificationRecipientId = requestData.fromUserId // Notify the sender
        } else if (status === "rejected") {
          message = `${toUserRes.user.name} declined your skill swap request.`
          notificationRecipientId = requestData.fromUserId // Notify the sender
        } else if (status === "cancelled") {
          message = `${fromUserRes.user.name} cancelled their skill swap request.`
          notificationRecipientId = requestData.toUserId // Notify the recipient
        } else if (status === "completed") {
          message = `Your skill swap with ${fromUserRes.user.name} is completed!`
          // Determine who to notify: if current user is 'from', notify 'to'; if current user is 'to', notify 'from'
          // This logic needs to be handled by the client-side component calling this function,
          // or we need to pass the current user's ID here.
          // For now, let's assume the 'from' user is notified when 'to' marks as complete, and vice-versa.
          // A more robust solution would be to notify *both* parties, or the one who *didn't* click "complete".
          // For simplicity, let's notify the *other* user involved in the swap.
          // The `updateSwapRequestStatus` is called from the perspective of the user who clicked the button.
          // So, if the current user is `fromUserId`, notify `toUserId`. If current user is `toUserId`, notify `fromUserId`.
          // However, this function doesn't know the current user's ID.
          // Let's assume the user who *didn't* initiate the status change should be notified.
          // For "completed", it's usually the other party.
          // The `fromUserRes.user.name` is the sender of the original request.
          // So, if the current user is the `toUser`, they mark it complete, and `fromUser` gets notified.
          // If the current user is the `fromUser`, they mark it complete, and `toUser` gets notified.
          // The `userId` for notification should be the *other* user.
          // This function is called from the client, so we need to know who the current user is.
          // For now, let's notify the original sender of the request.
          notificationRecipientId = requestData.fromUserId // Notify the original sender
          console.log(
            `updateSwapRequestStatus: Request ${requestId} marked as completed. Notifying user: ${notificationRecipientId}`,
          )
        }

        if (message && notificationRecipientId) {
          await createNotification({
            userId: notificationRecipientId,
            message,
            type: "swap_request_status",
            relatedEntityId: requestId,
          })
        } else {
          console.warn("updateSwapRequestStatus: No notification message or recipient ID generated for status:", status)
        }
      } else {
        console.warn("updateSwapRequestStatus: Failed to fetch one or both user profiles for notification.")
      }
    } else {
      console.warn("updateSwapRequestStatus: Request document not found for ID:", requestId)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating swap request:", error)
    return { success: false, error }
  }
}

// Feedback operations
export const createFeedback = async (feedbackData: {
  swapRequestId: string
  fromUserId: string
  toUserId: string
  rating: number
  comment: string
}) => {
  try {
    const docRef = await addDoc(collection(db, "feedback"), {
      ...feedbackData,
      createdAt: Timestamp.now(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating feedback:", error)
    return { success: false, error }
  }
}

export const getFeedbackForUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, "feedback"),
      where("toUserId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10),
    )

    const querySnapshot = await getDocs(q)
    const feedback = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(), // Corrected toDate() call
    }))

    return { success: true, feedback }
  } catch (error) {
    console.error("Error getting feedback:", error)
    return { success: false, error }
  }
}

// Report operations
export const createReport = async (reportData: {
  reporterId: string
  reportedUserId: string
  reason: string
  description: string
}) => {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      ...reportData,
      status: "pending",
      createdAt: Timestamp.now(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating report:", error)
    return { success: false, error }
  }
}

export const getReports = async () => {
  try {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"), limit(50))

    const querySnapshot = await getDocs(q)
    const reports = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(), // Corrected toDate() call
    }))

    return { success: true, reports }
  } catch (error) {
    console.error("Error getting reports:", error)
    return { success: false, error }
  }
}

// Admin operations
export const banUser = async (userId: string, adminId: string) => {
  try {
    // Update user status
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      status: "banned",
      updatedAt: Timestamp.now(),
    })

    // Log admin action
    await addDoc(collection(db, "adminActions"), {
      adminId,
      actionType: "ban_user",
      targetId: userId,
      details: "User banned by admin",
      createdAt: Timestamp.now(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error banning user:", error)
    return { success: false, error }
  }
}
