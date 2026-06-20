import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp as firebaseServerTimestamp,
  onSnapshot,
  orderBy,
  limit as firebaseLimit,
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Target configuration
export const TARGET_AMOUNT = 120000
export const ODD_INCOME = 5000
export const EVEN_INCOME = 3000
export const START_DATE = new Date(2026, 5, 19) // June 19, 2026
export const TOTAL_DAYS = 30

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isMock = !apiKey || apiKey.includes('Dummy') || apiKey.includes('your_') || apiKey === '';

export const isDemoMode = () => isMock;

// Helper to get income for a day
export const getIncomeForDay = (dayNumber) => {
  return dayNumber % 2 === 1 ? ODD_INCOME : EVEN_INCOME
}

// Helper to get date for a day
export const getDateForDay = (dayNumber) => {
  const date = new Date(START_DATE)
  date.setDate(date.getDate() + dayNumber - 1)
  return date
}

// ----------------------------------------------------
// Mock (Local Storage) Implementation State & Listeners
// ----------------------------------------------------
let trackerListeners = [];
let activityListeners = [];
let viewersListeners = [];

if (isMock) {
  // Listen to cross-tab storage changes
  window.addEventListener('storage', (event) => {
    if (event.key === 'mock_tracker_data') {
      const data = event.newValue ? JSON.parse(event.newValue) : null;
      if (data) {
        trackerListeners.forEach((cb) => cb(data));
      }
    } else if (event.key === 'mock_activities') {
      const activities = event.newValue ? JSON.parse(event.newValue) : [];
      activityListeners.forEach((cb) => cb(activities));
    } else if (event.key === 'mock_viewers') {
      const viewers = event.newValue ? JSON.parse(event.newValue) : {};
      const activeCount = calculateActiveViewers(viewers);
      viewersListeners.forEach((cb) => cb(activeCount));
    }
  });
}

const calculateActiveViewers = (viewers) => {
  const oneMinuteAgo = Date.now() - 60000;
  let count = 0;
  Object.values(viewers).forEach((lastSeen) => {
    if (lastSeen > oneMinuteAgo) {
      count++;
    }
  });
  return Math.max(1, count); // always show at least 1 (the current user)
};

const getMockTrackerData = () => {
  const raw = localStorage.getItem('mock_tracker_data');
  return raw ? JSON.parse(raw) : null;
};

const setMockTrackerData = (data) => {
  localStorage.setItem('mock_tracker_data', JSON.stringify(data));
  trackerListeners.forEach((cb) => cb(data));
};

const getMockActivities = () => {
  const raw = localStorage.getItem('mock_activities');
  return raw ? JSON.parse(raw) : [];
};

const setMockActivities = (activities) => {
  localStorage.setItem('mock_activities', JSON.stringify(activities));
  activityListeners.forEach((cb) => cb(activities));
};

const getMockViewers = () => {
  const raw = localStorage.getItem('mock_viewers');
  return raw ? JSON.parse(raw) : {};
};

const setMockViewers = (viewers) => {
  localStorage.setItem('mock_viewers', JSON.stringify(viewers));
  const activeCount = calculateActiveViewers(viewers);
  viewersListeners.forEach((cb) => cb(activeCount));
};

// ----------------------------------------------------
// Service API Functions
// ----------------------------------------------------

// Initialize tracker data
export const initializeTracker = async () => {
  if (isMock) {
    let data = getMockTrackerData();
    if (!data) {
      const days = [];
      for (let i = 1; i <= TOTAL_DAYS; i++) {
        const date = getDateForDay(i);
        days.push({
          dayNumber: i,
          date: date.toISOString(),
          income: getIncomeForDay(i),
          isOdd: i % 2 === 1,
          completed: false,
          completedBy: null,
          completedAt: null,
          completedByEmail: null,
        });
      }

      data = {
        targetAmount: TARGET_AMOUNT,
        days,
        totalEarned: 0,
        completedDays: 0,
        totalDays: TOTAL_DAYS,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      setMockTrackerData(data);
    }
    return;
  }

  const trackerRef = doc(db, 'tracker', 'main')
  const trackerSnap = await getDoc(trackerRef)

  if (!trackerSnap.exists()) {
    const days = []
    for (let i = 1; i <= TOTAL_DAYS; i++) {
      const date = getDateForDay(i)
      days.push({
        dayNumber: i,
        date: date.toISOString(),
        income: getIncomeForDay(i),
        isOdd: i % 2 === 1,
        completed: false,
        completedBy: null,
        completedAt: null,
        completedByEmail: null,
      })
    }

    await setDoc(trackerRef, {
      targetAmount: TARGET_AMOUNT,
      days,
      totalEarned: 0,
      completedDays: 0,
      totalDays: TOTAL_DAYS,
      createdAt: firebaseServerTimestamp(),
      lastUpdated: firebaseServerTimestamp(),
    })
  }
}

// Mark a day as completed
export const markDayCompleted = async (dayNumber, user) => {
  const userDisplayName = user.displayName || user.email || 'Anonymous';
  const userEmail = user.email || 'anonymous@example.com';

  if (isMock) {
    const data = getMockTrackerData();
    if (data) {
      const days = data.days;
      const dayIndex = dayNumber - 1;

      if (!days[dayIndex].completed) {
        days[dayIndex].completed = true;
        days[dayIndex].completedBy = userDisplayName;
        days[dayIndex].completedByEmail = userEmail;
        days[dayIndex].completedAt = new Date().toISOString();

        const income = days[dayIndex].income;
        const totalEarned = data.totalEarned + income;
        const completedDays = data.completedDays + 1;

        const updatedData = {
          ...data,
          days,
          totalEarned,
          completedDays,
          lastUpdated: new Date().toISOString(),
        };

        setMockTrackerData(updatedData);

        // Add activity
        await addActivity(
          `${userDisplayName} completed Day ${dayNumber}`,
          'completion',
          userEmail,
          dayNumber,
          income
        );
      }
    }
    return;
  }

  const trackerRef = doc(db, 'tracker', 'main')
  const trackerSnap = await getDoc(trackerRef)

  if (trackerSnap.exists()) {
    const data = trackerSnap.data()
    const days = data.days
    const dayIndex = dayNumber - 1

    if (!days[dayIndex].completed) {
      days[dayIndex].completed = true
      days[dayIndex].completedBy = userDisplayName
      days[dayIndex].completedByEmail = userEmail
      days[dayIndex].completedAt = firebaseServerTimestamp()

      const income = days[dayIndex].income
      const totalEarned = data.totalEarned + income
      const completedDays = data.completedDays + 1

      await updateDoc(trackerRef, {
        days,
        totalEarned,
        completedDays,
        lastUpdated: firebaseServerTimestamp(),
      })

      // Add activity
      await addActivity(
        `${userDisplayName} completed Day ${dayNumber}`,
        'completion',
        userEmail,
        dayNumber,
        income
      )
    }
  }
}

// Mark a day as incomplete (undo)
export const markDayIncomplete = async (dayNumber) => {
  if (isMock) {
    const data = getMockTrackerData();
    if (data) {
      const days = data.days;
      const dayIndex = dayNumber - 1;

      if (days[dayIndex].completed) {
        const income = days[dayIndex].income;
        const completedByEmail = days[dayIndex].completedByEmail;
        const completedBy = days[dayIndex].completedBy;

        days[dayIndex].completed = false;
        days[dayIndex].completedBy = null;
        days[dayIndex].completedByEmail = null;
        days[dayIndex].completedAt = null;

        const totalEarned = data.totalEarned - income;
        const completedDays = data.completedDays - 1;

        const updatedData = {
          ...data,
          days,
          totalEarned,
          completedDays,
          lastUpdated: new Date().toISOString(),
        };

        setMockTrackerData(updatedData);

        // Add activity
        await addActivity(
          `${completedBy || 'Someone'} undid completion of Day ${dayNumber}`,
          'undo',
          completedByEmail || 'unknown@example.com',
          dayNumber,
          0
        );
      }
    }
    return;
  }

  const trackerRef = doc(db, 'tracker', 'main')
  const trackerSnap = await getDoc(trackerRef)

  if (trackerSnap.exists()) {
    const data = trackerSnap.data()
    const days = data.days
    const dayIndex = dayNumber - 1

    if (days[dayIndex].completed) {
      const income = days[dayIndex].income
      const completedByEmail = days[dayIndex].completedByEmail
      const completedBy = days[dayIndex].completedBy

      days[dayIndex].completed = false
      days[dayIndex].completedBy = null
      days[dayIndex].completedByEmail = null
      days[dayIndex].completedAt = null

      const totalEarned = data.totalEarned - income
      const completedDays = data.completedDays - 1

      await updateDoc(trackerRef, {
        days,
        totalEarned,
        completedDays,
        lastUpdated: firebaseServerTimestamp(),
      })

      // Add activity
      await addActivity(
        `${completedBy || 'Someone'} undid completion of Day ${dayNumber}`,
        'undo',
        completedByEmail || 'unknown@example.com',
        dayNumber,
        0
      )
    }
  }
}

// Add activity log
export const addActivity = async (message, type, userEmail, dayNumber = null, amount = 0) => {
  if (isMock) {
    const activities = getMockActivities();
    const newActivity = {
      id: 'activity-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      message,
      type,
      userEmail,
      dayNumber,
      amount,
      timestamp: Date.now(),
    };
    activities.unshift(newActivity);
    // limit to 50
    setMockActivities(activities.slice(0, 50));
    return;
  }

  const activityRef = collection(db, 'activities')
  await addDoc(activityRef, {
    message,
    type,
    userEmail,
    dayNumber,
    amount,
    timestamp: firebaseServerTimestamp(),
  })
}

// Get recent activities
export const getRecentActivities = async (limitVal = 10) => {
  if (isMock) {
    const activities = getMockActivities();
    return activities.slice(0, limitVal);
  }

  const activitiesRef = collection(db, 'activities')
  const q = query(activitiesRef)
  const querySnapshot = await getDocs(q)
  const activities = []
  querySnapshot.forEach((doc) => {
    activities.push({ id: doc.id, ...doc.data() })
  })
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limitVal)
}

// Listen to activities updates
export const listenToActivities = (callback) => {
  if (isMock) {
    activityListeners.push(callback);
    callback(getMockActivities());
    return () => {
      activityListeners = activityListeners.filter((cb) => cb !== callback);
    };
  }

  const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'), firebaseLimit(50))
  return onSnapshot(q, (snapshot) => {
    const newActivities = []
    snapshot.forEach((doc) => {
      newActivities.push({ id: doc.id, ...doc.data() })
    })
    callback(newActivities)
  })
}

// Add viewer
export const addViewer = async (userId) => {
  if (isMock) {
    const viewers = getMockViewers();
    viewers[userId] = Date.now();
    setMockViewers(viewers);
    return;
  }

  const viewerRef = doc(db, 'viewers', userId)
  await setDoc(
    viewerRef,
    {
      lastSeen: firebaseServerTimestamp(),
    },
    { merge: true }
  )
}

// Get active viewers count
export const getActiveViewersCount = async () => {
  if (isMock) {
    return calculateActiveViewers(getMockViewers());
  }

  const viewersRef = collection(db, 'viewers')
  const oneMinuteAgo = Date.now() - 60000
  const querySnapshot = await getDocs(viewersRef)
  let count = 0
  querySnapshot.forEach((doc) => {
    const data = doc.data()
    if (data.lastSeen && data.lastSeen.toMillis() > oneMinuteAgo) {
      count++
    }
  })
  return count
}

// Listen to active viewers
export const listenToActiveViewers = (callback) => {
  if (isMock) {
    viewersListeners.push(callback);
    callback(calculateActiveViewers(getMockViewers()));
    return () => {
      viewersListeners = viewersListeners.filter((cb) => cb !== callback);
    };
  }

  const viewersRef = collection(db, 'viewers')
  return onSnapshot(viewersRef, (snapshot) => {
    const oneMinuteAgo = Date.now() - 60000
    let count = 0
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.lastSeen && data.lastSeen.toMillis() > oneMinuteAgo) {
        count++
      }
    })
    callback(count)
  })
}

// Get user statistics
export const getUserStatistics = async (userEmail) => {
  if (isMock) {
    const data = getMockTrackerData();
    if (data) {
      const userCompletions = data.days.filter(
        (day) => day.completedByEmail === userEmail && day.completed
      ).length;
      const userEarnings = data.days
        .filter((day) => day.completedByEmail === userEmail && day.completed)
        .reduce((sum, day) => sum + day.income, 0);

      return {
        completions: userCompletions,
        earnings: userEarnings,
        percentage: (userCompletions / TOTAL_DAYS) * 100,
      };
    }
    return { completions: 0, earnings: 0, percentage: 0 };
  }

  const trackerRef = doc(db, 'tracker', 'main')
  const trackerSnap = await getDoc(trackerRef)

  if (trackerSnap.exists()) {
    const data = trackerSnap.data()
    const userCompletions = data.days.filter(
      (day) => day.completedByEmail === userEmail && day.completed
    ).length
    const userEarnings = data.days
      .filter((day) => day.completedByEmail === userEmail && day.completed)
      .reduce((sum, day) => sum + day.income, 0)

    return {
      completions: userCompletions,
      earnings: userEarnings,
      percentage: (userCompletions / TOTAL_DAYS) * 100,
    }
  }

  return { completions: 0, earnings: 0, percentage: 0 }
}

// Get leaderboard
export const getLeaderboard = async () => {
  if (isMock) {
    const data = getMockTrackerData();
    if (data) {
      const leaderboard = {};
      data.days.forEach((day) => {
        if (day.completed && day.completedByEmail) {
          if (!leaderboard[day.completedByEmail]) {
            leaderboard[day.completedByEmail] = {
              name: day.completedBy,
              email: day.completedByEmail,
              completions: 0,
              earnings: 0,
            };
          }
          leaderboard[day.completedByEmail].completions += 1;
          leaderboard[day.completedByEmail].earnings += day.income;
        }
      });
      return Object.values(leaderboard).sort((a, b) => b.earnings - a.earnings);
    }
    return [];
  }

  const trackerRef = doc(db, 'tracker', 'main')
  const trackerSnap = await getDoc(trackerRef)

  if (trackerSnap.exists()) {
    const data = trackerSnap.data()
    const leaderboard = {}

    data.days.forEach((day) => {
      if (day.completed && day.completedByEmail) {
        if (!leaderboard[day.completedByEmail]) {
          leaderboard[day.completedByEmail] = {
            name: day.completedBy,
            email: day.completedByEmail,
            completions: 0,
            earnings: 0,
          }
        }
        leaderboard[day.completedByEmail].completions += 1
        leaderboard[day.completedByEmail].earnings += day.income
      }
    })

    return Object.values(leaderboard).sort((a, b) => b.earnings - a.earnings)
  }

  return []
}

// Listen to tracker updates
export const listenToTrackerUpdates = (callback) => {
  if (isMock) {
    trackerListeners.push(callback);
    const data = getMockTrackerData();
    if (data) {
      callback(data);
    }
    return () => {
      trackerListeners = trackerListeners.filter((cb) => cb !== callback);
    };
  }

  const trackerRef = doc(db, 'tracker', 'main')
  return onSnapshot(trackerRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data())
    }
  })
}
