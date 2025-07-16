import SwiftUI
import GoogleSignInSwift

// MARK: - Loading State Management
struct LandingViewLoadingState {
    var galleryImages: [String: Bool] = [:] // Track loading state for each gallery image by ID
    var howItWorksIcons: [String: Bool] = [:] // Track loading state for each how-it-works icon by URL
    var galleryAvatars: [String: Bool] = [:] // Track loading state for gallery avatars by URL
    var transferArrows: [String: Bool] = [:] // Track loading state for transfer arrows by card ID
    
    // Computed properties for overall section loading states
    var isGalleryLoading: Bool {
        !galleryImages.values.allSatisfy { !$0 }
    }
    
    var isHowItWorksLoading: Bool {
        !howItWorksIcons.values.allSatisfy { !$0 }
    }
    
    var isAnyVisualAssetLoading: Bool {
        isGalleryLoading || isHowItWorksLoading || !galleryAvatars.values.allSatisfy { !$0 } || !transferArrows.values.allSatisfy { !$0 }
    }
    
    // Gallery-specific loading state (for skeleton loading)
    var isGallerySectionLoading: Bool {
        // Gallery is loading if any gallery images, avatars, or transfer arrows are still loading
        isGalleryLoading || !galleryAvatars.values.allSatisfy { !$0 } || !transferArrows.values.allSatisfy { !$0 }
    }
    
    // Loading progress summary
    var loadingProgressSummary: String {
        let totalAssets = galleryImages.count + howItWorksIcons.count + galleryAvatars.count + transferArrows.count
        let loadedAssets = galleryImages.values.filter { !$0 }.count + 
                          howItWorksIcons.values.filter { !$0 }.count + 
                          galleryAvatars.values.filter { !$0 }.count + 
                          transferArrows.values.filter { !$0 }.count
        
        if totalAssets == 0 {
            return "No assets to load"
        }
        
        let percentage = Int((Double(loadedAssets) / Double(totalAssets)) * 100)
        return "\(loadedAssets)/\(totalAssets) assets loaded (\(percentage)%)"
    }
    
    // Helper methods to update loading states
    mutating func setGalleryImageLoading(_ imageId: String, isLoading: Bool) {
        galleryImages[imageId] = isLoading
    }
    
    mutating func setHowItWorksIconLoading(_ iconUrl: String, isLoading: Bool) {
        howItWorksIcons[iconUrl] = isLoading
    }
    
    mutating func setGalleryAvatarLoading(_ avatarUrl: String, isLoading: Bool) {
        galleryAvatars[avatarUrl] = isLoading
    }
    
    mutating func setTransferArrowLoading(_ cardId: String, isLoading: Bool) {
        transferArrows[cardId] = isLoading
    }
}

// MARK: - Skeleton Loading Components
struct GalleryCardSkeletonView: View {
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            // Main skeleton card (matches gallery image dimensions)
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.gray.opacity(0.3))
                .frame(height: 152)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                )
                .shadow(color: .neumorphicShadow.opacity(0.2), radius: 4, x: 2, y: 2)
            
            // Shimmer effect overlay
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            Color.clear,
                            Color.white.opacity(0.3),
                            Color.clear
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(height: 152)
                .offset(x: isAnimating ? 200 : -200)
                .animation(
                    Animation.linear(duration: 1.5)
                        .repeatForever(autoreverses: false),
                    value: isAnimating
                )
            
            // Friend avatar skeleton (top left)
            VStack {
                HStack {
                    Circle()
                        .fill(Color.gray.opacity(0.4))
                        .frame(width: 36, height: 36)
                        .overlay(Circle().stroke(Color.gray.opacity(0.6), lineWidth: 1))
                    Spacer()
                }
                Spacer()
            }
            .padding(8)
            
            // User avatar skeleton (bottom right)
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Circle()
                        .fill(Color.gray.opacity(0.4))
                        .frame(width: 40, height: 40)
                        .overlay(Circle().stroke(Color.gray.opacity(0.6), lineWidth: 1))
                }
            }
            .padding(8)
        }
        .frame(height: 152)
        .onAppear {
            isAnimating = true
        }
    }
}

struct LandingView: View {
    @EnvironmentObject var appState: AppState
    @State private var showSkipAuthModal = false
    @State private var isSigningIn = false
    @State private var showAuthError = false
    @State private var authErrorMessage = ""
    @State private var loadingState = LandingViewLoadingState()
    
    let galleryImages: [GalleryImage] = [
        GalleryImage(id: "gallery-3", url: "https://play.rosebud.ai/assets/jules-3-v3.jpg.png?6xGJ", alt: "Travel moment photo", friendPfp: "https://play.rosebud.ai/assets/friend-3-pfp-v2.png?RfB4", userPfp: "https://rosebud.ai/assets/jules-pfp.jpg?zlHT"),
        GalleryImage(id: "gallery-2", url: "https://play.rosebud.ai/assets/jules-02.jpg?8JqA", alt: "Group fun photo", friendPfp: "https://play.rosebud.ai/assets/friend-2-v2.png?itRQ", userPfp: "https://rosebud.ai/assets/jules-pfp.jpg?zlHT")
    ]
    let howItWorksSteps: [HowItWorksStep] = [
        HowItWorksStep(iconUrl: "https://play.rosebud.ai/assets/icon-invite.png?4HL1", text: "Invite a ", bold: "friend"),
        HowItWorksStep(iconUrl: "https://rosebud.ai/assets/icon-share.png?3ynl", text: "They share ", bold: "photos"),
        HowItWorksStep(iconUrl: "https://rosebud.ai/assets/icon-image-add.png?wXV4", text: "Get the photos of ", bold: "you")
    ]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color.secondaryColor
                    .ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 40) {
                        Spacer(minLength: 0)
                        VStack(spacing: 16) {
                            Text("From Your Lens")
                                .font(.system(size: 40, weight: .heavy))
                                .foregroundColor(.textColorPrimary)
                                .padding(.bottom, 4)
                            subtitleView
                                .font(.title3)
                                .foregroundColor(.textColorSecondary)
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.horizontal, 24)
                        }
                        // Mini gallery preview
                        if FeatureFlags.enableLandingGalleryImages {
                            // Calculate dynamic width for each gallery card
                            let galleryHorizontalPadding: CGFloat = 48 // increased from 32 to 48 for more side padding
                            let galleryCardSpacing: CGFloat = 21 // increased by 50% from 14
                            let galleryCardCount = CGFloat(galleryImages.count)
                            let galleryTotalSpacing = galleryCardSpacing * (galleryCardCount - 1)
                            let galleryAvailableWidth = geometry.size.width - (galleryHorizontalPadding * 2) - galleryTotalSpacing
                            let galleryCardWidth = galleryAvailableWidth / galleryCardCount
                            
                            ZStack {
                                // Skeleton loading (always rendered, shown when loading)
                                HStack(spacing: galleryCardSpacing) {
                                    ForEach(0..<galleryImages.count, id: \.self) { _ in
                                        GalleryCardSkeletonView()
                                            .frame(width: galleryCardWidth)
                                    }
                                }
                                .padding(.horizontal, galleryHorizontalPadding)
                                .frame(maxWidth: geometry.size.width - 40)
                                .opacity(loadingState.isGallerySectionLoading ? 1 : 0)
                                .animation(.easeInOut(duration: 0.3), value: loadingState.isGallerySectionLoading)
                                
                                // Real content (always rendered, hidden when loading)
                                HStack(spacing: galleryCardSpacing) {
                                    ForEach(galleryImages) { image in
                                        GalleryCardView(
                                            image: image,
                                            loadingState: $loadingState
                                        )
                                        .frame(width: galleryCardWidth)
                                    }
                                }
                                .padding(.horizontal, galleryHorizontalPadding)
                                .frame(maxWidth: geometry.size.width - 40)
                                .opacity(loadingState.isGallerySectionLoading ? 0 : 1)
                                .animation(.easeInOut(duration: 0.3), value: loadingState.isGallerySectionLoading)
                            }
                            .background(
                                GeometryReader { galleryGeo in
                                    Color.clear
                                }
                            )
                        }
                        // How it works section
                        if FeatureFlags.enableLandingHowItWorks {
                            HowItWorksSection(
                                steps: howItWorksSteps,
                                        loadingState: $loadingState
                                    )
                            .frame(maxWidth: geometry.size.width - 40)
                            .padding(.top, 8)
                            .background(
                                GeometryReader { howItWorksGeo in
                                    Color.clear
                                        .onAppear {
                                            if FeatureFlags.enableDebugLogLandingView {
                                                print("[LandingView][DEBUG] HowItWorks section width: \(howItWorksGeo.size.width)")
                                            }
                                        }
                                }
                            )
                        }
                        // Sign-in CTA
                        VStack(spacing: 16) {
                            if FeatureFlags.enableSkipAuthFlow {
                                Button(action: {
                                showSkipAuthModal = true
                        }) {
                            HStack(spacing: 12) {
                                        Image(systemName: "globe")
                                    .resizable()
                                    .frame(width: 22, height: 22)
                                Text("Sign in with Google")
                                    .font(.headline)
                            }
                            .padding(.vertical, 16)
                            .padding(.horizontal, 40)
                            .background(Color.primaryColorDark)
                            .foregroundColor(.white)
                            .cornerRadius(30)
                            .shadow(color: .neumorphicShadow.opacity(0.5), radius: 8, x: 4, y: 4)
                                }
                            } else {
                                // Use the custom sign-in button
                                CustomGoogleSignInButton(action: {
                                    isSigningIn = true
                                    Task {
                                        do {
                                            try await appState.handleGoogleSignIn()
                                        } catch {
                                            authErrorMessage = error.localizedDescription
                                            showAuthError = true
                                        }
                                        isSigningIn = false
                                    }
                                }, isLoading: isSigningIn)
                                .padding(.horizontal, 8)
                            }
                        }
                        .padding(.top, 16)
                        Spacer(minLength: 0)
                    }
                    .onAppear {
                        // Main VStack appeared
                    }
                    .onChange(of: loadingState.isGallerySectionLoading) { isGalleryLoading in
                        if FeatureFlags.enableDebugLogLandingView {
                            print("[LandingView][DEBUG] Gallery section loading state changed: \(isGalleryLoading ? "loading" : "complete")")
                        }
                    }
                    .padding(.horizontal, 20)
                    .frame(maxWidth: geometry.size.width)
                }
                if showSkipAuthModal {
                    SkipAuthModal(
                        isPresented: $showSkipAuthModal,
                        onConfirm: {
                            // Check if we should use test user with iCloud photos
                            if FeatureFlags.enableTestUserWithICloudPhotos && FeatureFlags.enableICloudPhotoUsage {
                                if FeatureFlags.enableDebugLogICloudPhotos {
                                    print("[DEBUG][LandingView] Setting up test user with iCloud photos")
                                }
                                // Set test user and change view - photo fetching will be triggered by PhotosView
                                appState.currentUser = User.mock
                                appState.currentView = .photos
                                
                                if FeatureFlags.enableDebugLogSkipAuth {
                                    print("[DEBUG][SkipAuth] Set currentUser to mock with iCloud photos enabled")
                                    print("[DEBUG][SkipAuth] iCloud photo count: \(FeatureFlags.defaultICloudPhotoCount)")
                                }
                            } else {
                                // Use mock photos as before
                                appState.currentUser = User.mock
                                appState.photos = Photo.mockPhotos
                                appState.currentView = .photos
                                if FeatureFlags.enableDebugLogSkipAuth {
                                    print("[DEBUG][SkipAuth] Set currentUser to mock: \(String(describing: appState.currentUser))")
                                    print("[DEBUG][SkipAuth] Set photos to mockPhotos. Count: \(appState.photos.count)")
                                    for photo in appState.photos {
                                        print("[DEBUG][SkipAuth] Photo: id=\(photo.id), alt=\(photo.altText ?? "") url=\(photo.baseUrl)")
                                    }
                                }
                            }
                        },
                        onCancel: {
                            // Just close the modal
                        }
                    )
                }
            }
        }
        .alert("Sign-In Error", isPresented: $showAuthError) {
            Button("OK") {
                showAuthError = false
            }
        } message: {
            Text(authErrorMessage)
        }
    }
    
    var subtitleView: Text {
        Text("Collect photos").bold().foregroundColor(.textColorPrimary)
        + Text(" from friends and ")
        + Text("share your own").bold().foregroundColor(.textColorPrimary)
        + Text(", all in ")
        + Text("one place").bold().foregroundColor(.textColorPrimary)
        + Text(".")
    }
}

struct GalleryImage: Identifiable {
    let id: String
    let url: String
    let alt: String
    let friendPfp: String
    let userPfp: String
}

struct GalleryCardView: View {
    let image: GalleryImage
    @State private var appear = false
    @Environment(\.colorScheme) var colorScheme
    @Binding var loadingState: LandingViewLoadingState
    
    var body: some View {
        ZStack {
            // Main gallery image
            AsyncImage(url: URL(string: image.url)) { phase in
                switch phase {
                case .empty:
                    ProgressView()
                        .frame(height: 152)
                        .onAppear {
                            loadingState.setGalleryImageLoading(image.id, isLoading: true)
                        }
                case .success(let img):
                    img
                        .resizable()
                        .aspectRatio(3/4, contentMode: .fill)
                        .frame(height: 152)
                        .clipped()
                        .cornerRadius(16)
                        .shadow(color: .neumorphicShadow.opacity(0.4), radius: 8, x: 4, y: 4)
                        .opacity(appear ? 1 : 0)
                        .animation(.easeIn(duration: 0.7).delay(0.2), value: appear)
                        .onAppear { 
                            appear = true
                            loadingState.setGalleryImageLoading(image.id, isLoading: false)
                        }
                case .failure:
                    Color.gray
                        .frame(height: 152)
                        .overlay(Text("Image").foregroundColor(.white))
                        .onAppear {
                            loadingState.setGalleryImageLoading(image.id, isLoading: false)
                        }
                @unknown default:
                    EmptyView()
                }
            }
            
            // Friend avatar (top left)
            VStack {
                HStack {
                    AsyncImage(url: URL(string: image.friendPfp)) { phase in
                        switch phase {
                        case .empty:
                            Circle().fill(Color.gray).frame(width: 36, height: 36)
                                .onAppear {
                                    loadingState.setGalleryAvatarLoading(image.friendPfp, isLoading: true)
                                }
                        case .success(let img):
                            img.resizable()
                                .frame(width: 36, height: 36)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.white, lineWidth: 2))
                                .onAppear {
                                    loadingState.setGalleryAvatarLoading(image.friendPfp, isLoading: false)
                                }
                        case .failure:
                            Circle().fill(Color.gray).frame(width: 36, height: 36)
                                .onAppear {
                                    loadingState.setGalleryAvatarLoading(image.friendPfp, isLoading: false)
                                }
                        @unknown default:
                            Circle().fill(Color.gray).frame(width: 36, height: 36)
                        }
                    }
                    Spacer()
                }
                Spacer()
            }
            .padding(8)
            
            // User avatar (bottom right)
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    AsyncImage(url: URL(string: image.userPfp)) { phase in
                        switch phase {
                        case .empty:
                            Circle().fill(Color.gray).frame(width: 40, height: 40)
                                .onAppear {
                                    loadingState.setGalleryAvatarLoading(image.userPfp, isLoading: true)
                                }
                        case .success(let img):
                            img.resizable()
                                .frame(width: 40, height: 40)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(Color.white, lineWidth: 2))
                                .onAppear {
                                    loadingState.setGalleryAvatarLoading(image.userPfp, isLoading: false)
                                }
                        case .failure:
                            Circle().fill(Color.gray).frame(width: 40, height: 40)
                                .onAppear {
                                    loadingState.setGalleryAvatarLoading(image.userPfp, isLoading: false)
                                }
                        @unknown default:
                            Circle().fill(Color.gray).frame(width: 40, height: 40)
                        }
                    }
                }
            }
            .padding(8)
            
            // Overlay transfer arrow (show for all cards, middle right, flipped vertically)
            GeometryReader { geo in
                AsyncImage(url: URL(string: IconURLs.whiteArrow)) { phase in
                    switch phase {
                    case .empty:
                        EmptyView()
                            .onAppear {
                                loadingState.setTransferArrowLoading(image.id, isLoading: true)
                            }
                    case .success(let img):
                        img.resizable()
                            .frame(width: 90, height: 60)
                            .scaleEffect(x: 1, y: -2) // Flip vertically and double height
                            .position(x: geo.size.width - 30, y: geo.size.height / 2 - 30) // Move higher
                            .onAppear {
                                loadingState.setTransferArrowLoading(image.id, isLoading: false)
                            }
                    case .failure:
                        EmptyView()
                            .onAppear {
                                loadingState.setTransferArrowLoading(image.id, isLoading: false)
                            }
                    @unknown default:
                        EmptyView()
                    }
                }
            }
        }
        .frame(height: 152)
    }
}



#Preview {
    LandingView().environmentObject(AppState())
} 
