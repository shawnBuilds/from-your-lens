import Foundation
import UserNotifications
import UIKit

// MARK: - Notification Service Protocol
protocol NotificationServiceProtocol {
    func requestPermission() async -> Bool
    func sendBatchCompareCompleteNotification(matchCount: Int)
    func sendDownloadCompleteNotification(downloadCount: Int)
}

// MARK: - Notification Categories
enum NotificationCategory: String, CaseIterable {
    case batchCompare = "BATCH_COMPARE"
    case download = "DOWNLOAD"
    
    var displayName: String {
        switch self {
        case .batchCompare:
            return "Face Matching"
        case .download:
            return "Download Complete"
        }
    }
}

// MARK: - Notification Service
class NotificationService: NotificationServiceProtocol {
    
    // MARK: - Singleton
    static let shared = NotificationService()
    
    private init() {
        setupNotificationCategories()
    }
    
    // MARK: - Permission Request
    func requestPermission() async -> Bool {
        if FeatureFlags.enableDebugLogNotifications {
            print("[NotificationService] Requesting notification permission...")
        }
        
        let center = UNUserNotificationCenter.current()
        
        do {
            let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
            
            if FeatureFlags.enableDebugLogNotifications {
                print("[NotificationService] Notification permission granted: \(granted)")
            }
            
            return granted
        } catch {
            if FeatureFlags.enableDebugLogNotifications {
                print("[NotificationService] Error requesting notification permission: \(error)")
            }
            return false
        }
    }
    
    // MARK: - Notification Methods
    private func sendNotification(title: String, body: String, category: NotificationCategory) {
        guard FeatureFlags.enablePushNotifications else {
            if FeatureFlags.enableDebugLogNotifications {
                print("[NotificationService] Push notifications disabled by feature flag")
            }
            return
        }
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.categoryIdentifier = category.rawValue
        
        // Add app icon badge
        content.badge = NSNumber(value: UIApplication.shared.applicationIconBadgeNumber + 1)
        
        let request = UNNotificationRequest(
            identifier: "notification-\(UUID().uuidString)",
            content: content,
            trigger: nil // Immediate delivery
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                if FeatureFlags.enableDebugLogNotifications {
                    print("[NotificationService] Error sending notification: \(error)")
                }
            } else {
                if FeatureFlags.enableDebugLogNotifications {
                    print("[NotificationService] ✅ Notification sent: \(title)")
                }
            }
        }
    }
    
    func sendBatchCompareCompleteNotification(matchCount: Int) {
        let title = "Face Matching Complete"
        let body = matchCount > 0 ? 
            "Found \(matchCount) matching photos for you to review!" :
            "Face matching completed. No matches found."
        
        sendNotification(title: title, body: body, category: .batchCompare)
    }
    
    func sendDownloadCompleteNotification(downloadCount: Int) {
        let title = "Download Complete"
        let body = "Successfully downloaded \(downloadCount) photos to your library."
        
        sendNotification(title: title, body: body, category: .download)
    }
    
    // MARK: - Private Methods
    private func setupNotificationCategories() {
        let center = UNUserNotificationCenter.current()
        
        // Create actions for different notification types
        let viewAction = UNNotificationAction(
            identifier: "VIEW_ACTION",
            title: "View Results",
            options: [.foreground]
        )
        
        let dismissAction = UNNotificationAction(
            identifier: "DISMISS_ACTION",
            title: "Dismiss",
            options: []
        )
        
        // Create categories with actions
        let batchCompareCategory = UNNotificationCategory(
            identifier: NotificationCategory.batchCompare.rawValue,
            actions: [viewAction, dismissAction],
            intentIdentifiers: [],
            options: []
        )
        
        let downloadCategory = UNNotificationCategory(
            identifier: NotificationCategory.download.rawValue,
            actions: [viewAction, dismissAction],
            intentIdentifiers: [],
            options: []
        )
        
        // Register categories
        center.setNotificationCategories([
            batchCompareCategory,
            downloadCategory
        ])
        
        if FeatureFlags.enableDebugLogNotifications {
            print("[NotificationService] Notification categories registered")
        }
    }
}

// MARK: - Notification Delegate
class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate, ObservableObject {
    @Published var lastNotificationTitle: String = ""
    @Published var notificationCount: Int = 0
    
    override init() {
        super.init()
        if FeatureFlags.enableDebugLogNotifications {
            print("[NotificationDelegate] Initialized")
        }
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
        
        // Update observable properties
        DispatchQueue.main.async {
            self.lastNotificationTitle = notification.request.content.title
            self.notificationCount += 1
        }
        
        if FeatureFlags.enableDebugLogNotifications {
            print("[NotificationDelegate] Notification will present: \(notification.request.content.title)")
        }
    }
    
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let identifier = response.actionIdentifier
        
        if FeatureFlags.enableDebugLogNotifications {
            print("[NotificationDelegate] Notification action received: \(identifier)")
        }
        
        // Handle different actions
        switch identifier {
        case "VIEW_ACTION":
            // Navigate to appropriate view based on notification category
            handleViewAction(for: response.notification.request.content.categoryIdentifier)
        case "DISMISS_ACTION":
            // Just dismiss the notification
            break
        default:
            break
        }
        
        completionHandler()
    }
    
    private func handleViewAction(for categoryIdentifier: String) {
        // This would typically navigate to the appropriate view
        // For now, we'll just log the action
        if FeatureFlags.enableDebugLogNotifications {
            print("[NotificationDelegate] View action for category: \(categoryIdentifier)")
        }
    }
} 