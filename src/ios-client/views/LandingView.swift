import SwiftUI
import GoogleSignInSwift

struct LandingView: View {
    @EnvironmentObject var appState: AppState
    @State private var showSkipAuthModal = false
    @State private var isSigningIn = false
    @State private var showAuthError = false
    @State private var authErrorMessage = ""
    
    let galleryImages: [GalleryImage] = [
        GalleryImage(id: "gallery-2", url: "https://play.rosebud.ai/assets/jules-02.jpg?8JqA", alt: "Group fun photo", friendPfp: "https://play.rosebud.ai/assets/friend-2-v2.png?itRQ", userPfp: "https://rosebud.ai/assets/jules-pfp.jpg?zlHT"),
        GalleryImage(id: "gallery-3", url: "https://play.rosebud.ai/assets/jules-3-v3.jpg.png?6xGJ", alt: "Travel moment photo", friendPfp: "https://play.rosebud.ai/assets/friend-3-pfp-v2.png?RfB4", userPfp: "https://rosebud.ai/assets/jules-pfp.jpg?zlHT")
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
                            HStack(spacing: galleryCardSpacing) {
                                ForEach(galleryImages) { image in
                                    GalleryCardView(image: image)
                                        .frame(width: galleryCardWidth)
                                }
                            }
                            .padding(.horizontal, galleryHorizontalPadding)
                            .frame(maxWidth: geometry.size.width - 40)
                            .background(
                                GeometryReader { galleryGeo in
                                    Color.clear
                                        .onAppear {
                                            if FeatureFlags.enableDebugLogLandingView {
                                                print("[LandingView][DEBUG] Gallery section width: \(galleryGeo.size.width)")
                                            }
                                        }
                                }
                            )
                        }
                        // How it works section
                        if FeatureFlags.enableLandingHowItWorks {
                            // Calculate dynamic width for each card (now for vertical stack, use maxWidth)
                            let horizontalPadding: CGFloat = 20 // match .padding(.horizontal, 20) on VStack
                            VStack(spacing: 16) {
                                ForEach(howItWorksSteps) { step in
                                    HowItWorksStepView(step: step)
                                        .frame(maxWidth: .infinity, minHeight: 60, maxHeight: 130)
                                }
                            }
                            .padding(.horizontal, horizontalPadding)
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
                                // Real Google Sign-In Button
                                GoogleSignInButton(action: {
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
                                })
                                .frame(height: 50)
                                .cornerRadius(25)
                                .disabled(isSigningIn)
                                .overlay(
                                    Group {
                                        if isSigningIn {
                                            ProgressView()
                                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                .scaleEffect(0.8)
                                        }
                                    }
                                )
                            }
                        }
                        .padding(.top, 16)
                        Spacer(minLength: 0)
                    }
                    .onAppear {
                        if FeatureFlags.enableDebugLogLandingView {
                            print("[LandingView][DEBUG] Device screen width: \(geometry.size.width)")
                        }
                    }
                    .background(
                        GeometryReader { vStackGeo in
                            Color.clear
                                .onAppear {
                                    if FeatureFlags.enableDebugLogLandingView {
                                        print("[LandingView][DEBUG] Main VStack width: \(vStackGeo.size.width)")
                                    }
                                }
                        }
                    )
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
    var body: some View {
        ZStack {
            AsyncImage(url: URL(string: image.url)) { phase in
                switch phase {
                case .empty:
                    ProgressView()
                        .frame(height: 152)
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
                        .onAppear { appear = true }
                case .failure:
                    Color.gray
                        .frame(height: 152)
                        .overlay(Text("Image").foregroundColor(.white))
                @unknown default:
                    EmptyView()
                }
            }
            // Friend avatar (top left)
            VStack {
                HStack {
                    AsyncImage(url: URL(string: image.friendPfp)) { phase in
                        switch phase {
                        case .success(let img):
                            img.resizable().frame(width: 36, height: 36).clipShape(Circle()).overlay(Circle().stroke(Color.white, lineWidth: 2))
                        default:
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
                        case .success(let img):
                            img.resizable().frame(width: 40, height: 40).clipShape(Circle()).overlay(Circle().stroke(Color.white, lineWidth: 2))
                        default:
                            Circle().fill(Color.gray).frame(width: 40, height: 40)
                        }
                    }
                }
            }
            .padding(8)
            // Overlay transfer arrow
            VStack {
                HStack {
                    Image(systemName: "arrow.right") // Replace with custom asset if available
                        .resizable()
                        .frame(width: 18, height: 18) // Reduced size
                        .foregroundColor(.white.opacity(0.8))
                        .rotationEffect(.degrees(45))
                        .offset(x: 16, y: -16)
                    Spacer()
                }
                Spacer()
            }
        }
        .frame(height: 152)
    }
}

struct HowItWorksStep: Identifiable {
    let id = UUID()
    let iconUrl: String
    let text: String
    let bold: String?
    init(iconUrl: String, text: String, bold: String? = nil) {
        self.iconUrl = iconUrl
        self.text = text
        self.bold = bold
    }
}

struct HowItWorksStepView: View {
    let step: HowItWorksStep
    var body: some View {
        HStack(spacing: 18) {
            AsyncImage(url: URL(string: step.iconUrl)) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().frame(width: 32, height: 32)
                default:
                    Color.gray.frame(width: 32, height: 32)
                }
            }
            if let bold = step.bold {
                (
                    Text(step.text).foregroundColor(.textColorPrimary) +
                    Text(bold).bold().foregroundColor(.textColorPrimary)
                )
            } else {
                Text(step.text).foregroundColor(.textColorPrimary)
            }
        }
        .padding(.horizontal, 18)
        .frame(height: 64)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.secondaryColor)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.textColorPrimary, lineWidth: 2)
        )
        .cornerRadius(16)
    }
}

#Preview {
    LandingView().environmentObject(AppState())
} 
