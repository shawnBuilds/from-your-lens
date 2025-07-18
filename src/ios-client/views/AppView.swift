import SwiftUI
import UserNotifications

@main
struct FromYourLensApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var notificationDelegate = NotificationDelegate()
    
    var body: some Scene {
        WindowGroup {
            AppView()
                .environmentObject(appState)
                .environmentObject(notificationDelegate)
                .onAppear {
                    // Set up notification delegate
                    UNUserNotificationCenter.current().delegate = notificationDelegate
                }
        }
    }
}

struct AppView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Group {
            if appState.isLoading {
                LoadingView()
            } else if appState.currentUser != nil && appState.currentView == .photos {
                PhotosView()
            } else if appState.currentView == .landing {
                LandingView()
            } else {
                // Fallback for logged-in user - redirect to photos
                if appState.currentUser != nil {
                    Color.clear
                        .onAppear {
                            print("[AppView] Fallback for logged-in user. Redirecting to PHOTOS.")
                            appState.currentView = .photos
                        }
                } else {
                    // Fallback for non-logged-in user - redirect to landing
                    Color.clear
                        .onAppear {
                            print("[AppView] Fallback for non-logged-in user. Redirecting to LANDING.")
                            appState.currentView = .landing
                        }
                }
            }
        }
        .onAppear {
            print("[AppView] AppView appeared with state:", 
                  "currentUser: \(appState.currentUser != nil),",
                  "currentView: \(appState.currentView),",
                  "isLoading: \(appState.isLoading)")
        }
    }
}

#Preview {
    AppView()
        .environmentObject(AppState())
} 