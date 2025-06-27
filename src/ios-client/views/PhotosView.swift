import SwiftUI

struct PhotosView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTab: PhotoTabType = .allPhotos
    
    var filteredPhotos: [Photo] {
        switch selectedTab {
        case .allPhotos:
            return appState.photos
        case .photosOfYou:
            guard let userId = appState.currentUser?.id else { return [] }
            return appState.photos.filter { $0.photoOf == userId }
        }
    }
    
    var emptyMessage: String {
        switch selectedTab {
        case .photosOfYou:
            return "No photos yet. Ask friends to send photos to you!"
        default:
            return "No photos yet. Upload some memories!"
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            HeaderView {
                HStack(spacing: 8) {
                    if let user = appState.currentUser {
                        Text(user.displayName)
                            .font(.subheadline)
                            .foregroundColor(.textColorSecondary)
                    }
                    Button(action: {
                        Task { await appState.handleLogout() }
                    }) {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                            .foregroundColor(.primaryColorDark)
                    }
                    .buttonStyle(.plain)
                }
            }
            Divider()
            // Photo navigation tabs
            PhotoTabsView(
                selectedTab: $selectedTab,
                onTabSelected: { _ in }
            )
            .padding(.bottom, 4)
            // Photo gallery
            PhotoGalleryView(
                photos: filteredPhotos,
                isLoading: appState.isFetchingPhotos,
                error: appState.fetchPhotosError?.localizedDescription,
                loadMore: nil, // Add pagination later
                hasMore: false,
                emptyMessage: emptyMessage
            )
            Spacer(minLength: 0)
            // Matching action buttons at the bottom
            MatchingTabsView(
                onFindPhotos: {
                    appState.isBatchCompareModalPresented = true
                },
                onSendPhotos: {}
            )
            .padding(.vertical, 12)
        }
        .background(Color.secondaryColor)
        .edgesIgnoringSafeArea(.bottom)
        .sheet(isPresented: $appState.isBatchCompareModalPresented) {
            BatchCompareModal(isPresented: $appState.isBatchCompareModalPresented)
                .environmentObject(appState)
        }
        .onAppear {
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][PhotosView] PhotosView appeared")
            }
            
            // Trigger photo fetching if we have a user but no photos yet
            if let user = appState.currentUser, appState.photos.isEmpty, !appState.isFetchingPhotos {
                if FeatureFlags.enableDebugLogICloudPhotos {
                    print("[DEBUG][PhotosView] Triggering photo fetch for user: \(user.displayName)")
                }
                
                Task {
                    await appState.fetchUserPhotos()
                    await appState.fetchInitialPhotosOfUser()
                }
            }
        }
        .onChange(of: appState.photos) { newPhotos in
            if FeatureFlags.enableDebugLogICloudPhotos {
                print("[DEBUG][PhotosView] Photos array changed, new count: \(newPhotos.count)")
            }
        }
        .onChange(of: selectedTab) { newTab in
            // Tab change logging removed for cleaner console output
        }
    }
}

#Preview {
    PhotosView().environmentObject(AppState())
} 
