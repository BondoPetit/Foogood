/**
 * Notification service for food expiry alerts
 */
import * as Notifications from "expo-notifications";
import { daysUntilExpiry } from '../utils/dateUtils';

// Format date to Danish format (DD/MM/YYYY)
function formatDateDanish(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

/**
 * Schedule notification for food item expiry
 * @param {Object} item - Food item
 * @returns {Promise<string|null>} Notification ID or null if failed
 */
export async function scheduleExpiryNotification(item) {
  try {
    const daysLeft = daysUntilExpiry(item.expiryDate);
    console.log(`Scheduling notification for ${item.name}, expires in ${daysLeft} days`);
    
    // Don't schedule if already expired or expiring today/tomorrow
    if (daysLeft <= 1) {
      console.log(`Item ${item.name} expires too soon (${daysLeft} days), not scheduling notification`);
      return null;
    }

    // Parse the expiry date string correctly
    const expiryDate = new Date(item.expiryDate + 'T00:00:00'); // Add time to avoid timezone issues
    console.log(`Expiry date parsed: ${expiryDate}`);
    
    // Schedule for day before expiry at 6 PM
    const notificationDate = new Date(expiryDate);
    notificationDate.setDate(notificationDate.getDate() - 1);
    notificationDate.setHours(18, 0, 0, 0);
    console.log(`Notification scheduled for: ${notificationDate}`);

    // Don't schedule if notification time is in the past
    const now = new Date();
    if (notificationDate <= now) {
      console.log(`Notification time ${notificationDate} is in the past (now: ${now}), not scheduling`);
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍯 FooGood påmindelse",
        body: `${item.name} udløber den ${formatDateDanish(item.expiryDate)}`,
        sound: false,
      },
      trigger: {
        date: notificationDate,
      },
    });

    console.log(`Notification scheduled with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    return null;
  }
}

/**
 * Cancel notification by ID
 * @param {string} notificationId - Notification ID to cancel
 * @returns {Promise<void>}
 */
export async function cancelNotification(notificationId) {
  try {
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch (error) {
    console.error("Failed to cancel notification:", error);
  }
}

/**
 * Get all scheduled notifications (for debugging)
 * @returns {Promise<Array>} Array of scheduled notifications
 */
export async function getAllScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log("All scheduled notifications:", notifications);
    return notifications;
  } catch (error) {
    console.error("Failed to get scheduled notifications:", error);
    return [];
  }
}

/**
 * Reschedule all notifications for items
 * @param {Array} items - Array of food items
 * @returns {Promise<Array>} Updated items with new notification IDs
 */
export async function rescheduleAllNotifications(items) {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule new notifications for all items
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        const notificationId = await scheduleExpiryNotification(item);
        return { ...item, notificationId };
      })
    );

    return updatedItems;
  } catch (error) {
    console.error("Failed to reschedule notifications:", error);
    return items;
  }
}