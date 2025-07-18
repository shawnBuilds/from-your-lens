import SwiftUI

struct BatchCompareModal: View {
    @EnvironmentObject var appState: AppState
    @Binding var isPresented: Bool
    
    @State private var selectedSourcePhoto: Photo?
    @State private var selectedTargetPhotos: [Photo] = []
    @State private var showingSourcePhotoPicker = false
    @State private var showingTargetPhotoPicker = false
    @State private var showingProfilePicturePicker = false
    @State private var showingNotificationPermissionModal = false
    
    // Auto-populate target photos when modal appears
    private var autoPopulatedTargetPhotos: [Photo] {
        let allPhotos = appState.photos
        let maxCount = FeatureFlags.defaultBatchTargetCount
        let result = Array(allPhotos.prefix(maxCount))
        return result
    }
    
    // Auto-populate source photo with profile picture when available
    private var autoPopulatedSourcePhoto: Photo? {
        // Determine which user's profile picture to use based on mode
        let targetUser: User?
        switch appState.batchCompareMode {
        case .findPhotos:
            targetUser = appState.currentUser
        case .sendPhotos:
            targetUser = appState.selectedTargetUser
        }
        
        guard let user = targetUser,
              let profileUrl = user.profilePictureUrl,
              !profileUrl.isEmpty else {
            return nil
        }
        
        let profilePhoto = Photo.fromProfilePicture(url: profileUrl, userId: user.id)
        return profilePhoto
    }
    
    var body: some View {
        ZStack {
            Color.secondaryColor
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                BatchCompareModalHeader(isPresented: $isPresented, appState: appState)
                
                ScrollView {
                    VStack(spacing: 24) {
                        // State-based content
                        switch appState.batchCompareState {
                        case .waiting:
                            WaitingStateContent(
                                selectedSourcePhoto: $selectedSourcePhoto,
                                selectedTargetPhotos: $selectedTargetPhotos,
                                showingSourcePhotoPicker: $showingSourcePhotoPicker,
                                showingTargetPhotoPicker: $showingTargetPhotoPicker,
                                showingProfilePicturePicker: $showingProfilePicturePicker,
                                showingNotificationPermissionModal: $showingNotificationPermissionModal,
                                autoPopulatedPhotos: autoPopulatedTargetPhotos,
                                appState: appState
                            )
                        case .matching:
                            MatchingStateContent(
                                selectedSourcePhoto: selectedSourcePhoto,
                                selectedTargetPhotos: selectedTargetPhotos,
                                appState: appState
                            )
                        case .matched:
                            MatchedStateContent(
                                selectedSourcePhoto: selectedSourcePhoto,
                                selectedTargetPhotos: selectedTargetPhotos,
                                appState: appState,
                                isPresented: $isPresented
                            )
                        case .error:
                            ErrorStateContent(
                                selectedSourcePhoto: selectedSourcePhoto,
                                selectedTargetPhotos: selectedTargetPhotos,
                                appState: appState,
                                isPresented: $isPresented
                            )
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.vertical, 32)
                }
                .background(Color.secondaryColor)
            }
            .frame(maxWidth: 500, maxHeight: .infinity)
            .padding(.vertical, 0)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 8, x: 0, y: 4)
        }
        .sheet(isPresented: $showingSourcePhotoPicker) {
            PhotoPickerView(selectedPhotos: Binding(
                get: { selectedSourcePhoto.map { [$0] } ?? [] },
                set: { photos in
                    selectedSourcePhoto = photos.first
                }
            ), maxSelection: FeatureFlags.maxSourcePhotoSelection, title: "Choose Source Photo")
        }
        .sheet(isPresented: $showingTargetPhotoPicker) {
            PhotoPickerView(selectedPhotos: $selectedTargetPhotos, maxSelection: FeatureFlags.maxTargetPhotoSelection, title: "Choose Target Photos")
        }
        .sheet(isPresented: $showingProfilePicturePicker) {
            ProfilePicturePickerModal(
                appState: appState,
                hasPromptedForProfilePicture: .constant(false),
                isAutoPrompt: false
            )
        }
        .sheet(isPresented: $showingNotificationPermissionModal) {
            NotificationPermissionModal(
                isPresented: $showingNotificationPermissionModal,
                onEnableNotifications: {
                    Task {
                        await requestNotificationPermissionAndProceed()
                    }
                },
                onContinueWithoutNotifications: {
                    proceedWithBatchCompare()
                }
            )
        }
        .onChange(of: showingProfilePicturePicker) { isPresented in
            // When profile picture picker is dismissed, check if we should auto-populate source photo
            if !isPresented && selectedSourcePhoto == nil {
                selectedSourcePhoto = autoPopulatedSourcePhoto
            }
        }
        .onAppear {
            // Auto-populate target photos when modal appears
            selectedTargetPhotos = autoPopulatedTargetPhotos
            
            // Auto-populate source photo with profile picture when available
            if selectedSourcePhoto == nil {
                selectedSourcePhoto = autoPopulatedSourcePhoto
            }
        }
    }
    
    // MARK: - Helper Methods
    private func requestNotificationPermissionAndProceed() async {
        let granted = await NotificationService.shared.requestPermission()
        
        await MainActor.run {
            if FeatureFlags.enableDebugLogNotifications {
                print("[BatchCompareModal] Notification permission result: \(granted)")
            }
            proceedWithBatchCompare()
        }
    }
    
    private func proceedWithBatchCompare() {
        guard let sourcePhoto = selectedSourcePhoto else { return }
        
        Task {
            await appState.startBatchCompare(
                sourcePhoto: sourcePhoto,
                targetPhotos: selectedTargetPhotos
            )
        }
    }
}

// MARK: - Header Component
struct BatchCompareModalHeader: View {
    @Binding var isPresented: Bool
    @ObservedObject var appState: AppState
    
    @MainActor
    var title: String {
        switch appState.batchCompareMode {
        case .findPhotos:
            return "Find Photos of You"
        case .sendPhotos:
            return "Send Photos to \(appState.selectedTargetUser?.displayName ?? "Friend")"
        }
    }
    
    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.textColorPrimary)
                .padding(.leading)
            Spacer()
            Button(action: { 
                isPresented = false
                appState.resetBatchCompare()
            }) {
                Image(systemName: "xmark")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.textColorSecondary)
                    .frame(width: 44, height: 44)
                    .background(Color.primaryColor.opacity(0.12))
                    .clipShape(Circle())
            }
            .accessibilityLabel("Close")
            .padding(.trailing, 16)
        }
        .padding(.vertical, 28)
        .background(Color.secondaryColor)
        Divider()
    }
}

// MARK: - Source Photo Section
struct SourcePhotoSection: View {
    @Binding var selectedSourcePhoto: Photo?
    @Binding var showingSourcePhotoPicker: Bool
    @Binding var showingProfilePicturePicker: Bool
    @ObservedObject var appState: AppState
    
    @MainActor
    var sectionTitle: String {
        switch appState.batchCompareMode {
        case .findPhotos:
            return "Photo of You"
        case .sendPhotos:
            return "Photo of \(appState.selectedTargetUser?.displayName ?? "Friend")"
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Spacer()
                Text(sectionTitle)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.textColorPrimary)
                Spacer()
            }
            
            if let sourcePhoto = selectedSourcePhoto {
                SourcePhotoSelectedView(sourcePhoto: sourcePhoto) {
                    selectedSourcePhoto = nil
                }
            } else {
                SourcePhotoPickerButton {
                    // Determine which user's profile picture to check based on mode
                    let targetUser: User?
                    switch appState.batchCompareMode {
                    case .findPhotos:
                        targetUser = appState.currentUser
                    case .sendPhotos:
                        targetUser = appState.selectedTargetUser
                    }
                    
                    // Check if target user has a profile picture
                    if let user = targetUser,
                       let profileUrl = user.profilePictureUrl,
                       !profileUrl.isEmpty {
                        // User has profile picture, show regular photo picker
                        showingSourcePhotoPicker = true
                    } else {
                        // No profile picture, show profile picture picker
                        showingProfilePicturePicker = true
                    }
                }
            }
        }
    }
}

struct SourcePhotoSelectedView: View {
    let sourcePhoto: Photo
    let onChange: () -> Void
    
    var body: some View {
        HStack {
            Spacer()
            BatchComparePhotoView(photo: sourcePhoto, size: 80)
            Spacer()
        }
    }
}

struct SourcePhotoPickerButton: View {
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: "photo")
                Text("Choose Profile Picture")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.primaryColor.opacity(0.1))
            .foregroundColor(Color.primaryColorDark)
            .clipShape(RoundedRectangle(cornerRadius: 22))
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
        }
    }
}

// MARK: - Target Photo Picker Button
struct TargetPhotoPickerButton: View {
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: "photo.on.rectangle.angled")
                Text("Select Photos to Search")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.primaryColor.opacity(0.1))
            .foregroundColor(Color.primaryColorDark)
            .clipShape(RoundedRectangle(cornerRadius: 22))
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
        }
    }
}

// MARK: - Target Photos Section
struct TargetPhotosSection: View {
    @Binding var selectedTargetPhotos: [Photo]
    @Binding var showingTargetPhotoPicker: Bool
    let autoPopulatedPhotos: [Photo]
    @State private var carouselIndex: Int = 0
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Spacer()
                Text("Photos to Search")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.textColorPrimary)
                Spacer()
            }
            if !selectedTargetPhotos.isEmpty {
                TargetPhotosCarouselView(
                    photos: $selectedTargetPhotos,
                    carouselIndex: $carouselIndex
                )
            } else {
                TargetPhotoPickerButton {
                    showingTargetPhotoPicker = true
                }
            }
        }
        .onAppear {
            if FeatureFlags.enableDebugLogFaceDetection {
                print("[TargetPhotosSection] Displaying \(selectedTargetPhotos.count) selected photos out of \(autoPopulatedPhotos.count) auto-populated photos")
            }
        }
    }
}

// MARK: - Progress Section
struct ProgressSection: View {
    @ObservedObject var appState: AppState
    
    var body: some View {
        if appState.isBatchComparing {
            VStack(spacing: 12) {
                ProgressView(value: appState.batchCompareProgress)
                    .progressViewStyle(LinearProgressViewStyle())
                
                Text("Comparing photos... \(Int(appState.batchCompareProgress * 100))%")
                    .font(.caption)
                    .foregroundColor(.textColorSecondary)
            }
            .padding()
            .background(Color.primaryColor.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}

// MARK: - Results Section
struct ResultsSection: View {
    let results: [BatchCompareResult]
    @ObservedObject var appState: AppState
    @State private var carouselIndex: Int = 0
    
    var matchingResults: [BatchCompareResult] {
        results.filter { !$0.faceMatches.isEmpty }
    }
    
    var body: some View {
        if !results.isEmpty && !matchingResults.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                BaseCarouselView(items: matchingResults, currentIndex: $carouselIndex) { result in
                    ZStack(alignment: .topTrailing) {
                        BatchComparePhotoView(photo: result.photo, size: 220)
                        
                        // Overlay X button for removing matching results
                        Button(action: {
                            if let index = matchingResults.firstIndex(where: { $0.id == result.id }) {
                                if FeatureFlags.enableDebugBatchCompareModal {
                                    print("[BatchCompareModal] Removing matching result: \(result.targetFileName)")
                                }
                                // Note: This would need to be implemented in AppState to actually remove from results
                            }
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.red)
                                .font(.system(size: 32, weight: .bold))
                                .background(Color.white.opacity(0.8))
                                .clipShape(Circle())
                                .padding(6)
                        }
                        .offset(x: -8, y: 8)
                    }
                    .frame(width: 220, height: 220)
                    .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 8, x: 0, y: 4)
                }
                .onAppear {
                    if FeatureFlags.enableDebugBatchCompareModal {
                        print("[BatchCompareModal] Displaying \(matchingResults.count) matching results")
                    }
                }
            }
        }
    }
}

// MARK: - Action Buttons Section
struct ActionButtonsSection: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    @ObservedObject var appState: AppState
    @Binding var isPresented: Bool
    @Binding var showingNotificationPermissionModal: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            if selectedSourcePhoto != nil && !selectedTargetPhotos.isEmpty && !appState.isBatchComparing {
                Button(action: {
                    Task {
                        let shouldProceed = await appState.startBatchCompareWithPermissionCheck(
                            sourcePhoto: selectedSourcePhoto!,
                            targetPhotos: selectedTargetPhotos
                        )
                        
                        if !shouldProceed {
                            // Show permission modal
                            showingNotificationPermissionModal = true
                        }
                    }
                }) {
                    HStack {
                        Image(systemName: "magnifyingglass")
                        Text("Find Photos of You")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryColor)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 22))
                    .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
            }
            
            if !appState.batchCompareResults.isEmpty && !appState.isBatchComparing {
                Button(action: {
                    isPresented = false
                    appState.resetBatchCompare()
                }) {
                    Text("Done")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.neumorphicShadow.opacity(0.3))
                        .foregroundColor(Color.textColorPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                        .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
            }
        }
    }
}

// MARK: - Photo Picker View
struct PhotoPickerView: View {
    @EnvironmentObject var appState: AppState
    @Binding var selectedPhotos: [Photo]
    let maxSelection: Int
    let title: String
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack {
                if appState.photos.isEmpty {
                    EmptyPhotosView()
                } else {
                    PhotoGridView(selectedPhotos: $selectedPhotos, maxSelection: maxSelection)
                }
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct EmptyPhotosView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            Text("No photos available")
                .font(.headline)
            Text("Photos will appear here once loaded")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct PhotoGridView: View {
    @EnvironmentObject var appState: AppState
    @Binding var selectedPhotos: [Photo]
    let maxSelection: Int
    
    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
            ForEach(appState.photos) { photo in
                PhotoPickerItemView(
                    photo: photo,
                    isSelected: selectedPhotos.contains { $0.id == photo.id },
                    onTap: {
                        if selectedPhotos.contains(where: { $0.id == photo.id }) {
                            selectedPhotos.removeAll { $0.id == photo.id }
                        } else if selectedPhotos.count < maxSelection {
                            selectedPhotos.append(photo)
                        }
                    }
                )
            }
        }
        .padding()
    }
}

// MARK: - Photo Picker Item View
struct PhotoPickerItemView: View {
    let photo: Photo
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            ZStack {
                AsyncImage(url: URL(string: photo.baseUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                }
                .frame(width: 100, height: 100)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                
                if isSelected {
                    VStack {
                        HStack {
                            Spacer()
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.blue)
                                .background(Color.white)
                                .clipShape(Circle())
                        }
                        Spacer()
                    }
                    .padding(4)
                }
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    BatchCompareModal(isPresented: .constant(true))
        .environmentObject(AppState())
}

// MARK: - State-Based Content Components

// MARK: - Waiting State Content
struct WaitingStateContent: View {
    @Binding var selectedSourcePhoto: Photo?
    @Binding var selectedTargetPhotos: [Photo]
    @Binding var showingSourcePhotoPicker: Bool
    @Binding var showingTargetPhotoPicker: Bool
    @Binding var showingProfilePicturePicker: Bool
    @Binding var showingNotificationPermissionModal: Bool
    let autoPopulatedPhotos: [Photo]
    @ObservedObject var appState: AppState
    
    @MainActor
    var buttonText: String {
        switch appState.batchCompareMode {
        case .findPhotos:
            return "Find Photos of You"
        case .sendPhotos:
            return "Find Photos of \(appState.selectedTargetUser?.displayName ?? "Friend")"
        }
    }
    
    var body: some View {
        VStack(spacing: 24) {
            SourcePhotoSection(
                selectedSourcePhoto: $selectedSourcePhoto,
                showingSourcePhotoPicker: $showingSourcePhotoPicker,
                showingProfilePicturePicker: $showingProfilePicturePicker,
                appState: appState
            )
            
            TargetPhotosSection(
                selectedTargetPhotos: $selectedTargetPhotos,
                showingTargetPhotoPicker: $showingTargetPhotoPicker,
                autoPopulatedPhotos: autoPopulatedPhotos
            )
            
            // Start button
            if selectedSourcePhoto != nil && !selectedTargetPhotos.isEmpty {
                Button(action: {
                    Task {
                        let shouldProceed = await appState.startBatchCompareWithPermissionCheck(
                            sourcePhoto: selectedSourcePhoto!,
                            targetPhotos: selectedTargetPhotos
                        )
                        
                        if !shouldProceed {
                            // Show permission modal
                            showingNotificationPermissionModal = true
                        }
                    }
                }) {
                    HStack {
                        Image(systemName: "magnifyingglass")
                        Text(buttonText)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryColor)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 22))
                    .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
            }
        }
    }
}

// MARK: - Matching State Content
struct MatchingStateContent: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    @ObservedObject var appState: AppState
    
    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            
            // Time estimate and explanation - now the focal point
            VStack(spacing: 20) {
                Image(systemName: "clock.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.primaryColor)
                
                Text("This may take a few minutes...")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.textColorPrimary)
                    .multilineTextAlignment(.center)
                
                Text("We'll send you a notification when the photos are ready for you to review. Feel free to check out other apps on your phone while you wait!")
                    .font(.title3)
                    .foregroundColor(.textColorSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(nil)
                    .padding(.horizontal, 16)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 40)
            
            Spacer()
        }
    }
}

// MARK: - Matched State Content
struct MatchedStateContent: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    @ObservedObject var appState: AppState
    @Binding var isPresented: Bool
    
    var body: some View {
        VStack(spacing: 24) {
            // Check if we have any matching results
            let matchingResults = appState.batchCompareResults.filter { !$0.faceMatches.isEmpty }
            
            if !matchingResults.isEmpty {
                // Show results carousel when we have matches
                ResultsSection(results: appState.batchCompareResults, appState: appState)
                
                // Confirm matches button
                Button(action: {
                    Task {
                        await appState.confirmMatches()
                        isPresented = false
                        appState.resetBatchCompare()
                    }
                }) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                        Text("Confirm \(matchingResults.count) Matches")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryColor)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 22))
                    .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
            } else {
                // Show "No Matches Found" view when no matches
                NoMatchesFoundView(appState: appState, isPresented: $isPresented)
            }
        }
    }
}

// MARK: - Error State Content
struct ErrorStateContent: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    @ObservedObject var appState: AppState
    @Binding var isPresented: Bool
    
    var body: some View {
        VStack(spacing: 24) {
            // Error message
            VStack(spacing: 16) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.orange)
                
                Text("Face Matching Failed")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.textColorPrimary)
                
                if let error = appState.batchCompareError {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.textColorSecondary)
                        .multilineTextAlignment(.center)
                }
            }
            .padding()
            .background(Color.primaryColor.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            
            // Action buttons
            VStack(spacing: 12) {
                Button(action: {
                    isPresented = false
                    appState.resetBatchCompare()
                }) {
                    Text("Close")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.neumorphicShadow.opacity(0.3))
                        .foregroundColor(Color.textColorPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                        .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
                
                Button(action: {
                    appState.resetBatchCompare()
                }) {
                    Text("Try Again")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.primaryColor.opacity(0.1))
                        .foregroundColor(Color.primaryColorDark)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                        .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
            }
        }
    }
} 

struct BatchComparePhotoView: View {
    let photo: Photo
    let size: CGFloat
    var body: some View {
        Group {
            if let s3Url = photo.s3Url, !s3Url.isEmpty {
                // Handle S3 photos (shared photos)
                AsyncImage(url: URL(string: s3Url)) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: size, height: size)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: size, height: size)
                            .clipped()
                            .cornerRadius(8)
                    case .failure:
                        VStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.red)
                                .font(.largeTitle)
                            Text("Failed to load")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(width: size, height: size)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    @unknown default:
                        EmptyView()
                    }
                }
            } else if photo.baseUrl.hasPrefix("icloud://") {
                ICloudPhotoView(photo: photo, cellSize: size)
                    .id(photo.id) // Force state reset when photo changes
            } else {
                AsyncImage(url: URL(string: photo.baseUrl)) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: size, height: size)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: size, height: size)
                            .clipped()
                            .cornerRadius(8)
                    case .failure:
                        VStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.red)
                                .font(.largeTitle)
                            Text("Failed to load")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(width: size, height: size)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    @unknown default:
                        EmptyView()
                    }
                }
            }
        }
        .id(photo.id) // Ensure the whole view resets when photo changes
    }
} 

// MARK: - No Matches Found View
struct NoMatchesFoundView: View {
    @ObservedObject var appState: AppState
    @Binding var isPresented: Bool
    
    var body: some View {
        VStack(spacing: 24) {
            // Icon
            Image(systemName: "magnifyingglass")
                .font(.system(size: 64))
                .foregroundColor(.gray)
                .padding(.bottom, 8)
            
            // Main message
            VStack(spacing: 16) {
                Text("No Photos Found")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.textColorPrimary)
                
                Text("We couldn't find any photos with the person you're looking for.")
                    .font(.body)
                    .foregroundColor(.textColorSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(nil)
            }
            
            // Helpful suggestions
            VStack(alignment: .leading, spacing: 12) {
                Text("Here are some things to check:")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.textColorPrimary)
                
                VStack(alignment: .leading, spacing: 8) {
                    SuggestionRow(
                        icon: "person.crop.circle",
                        text: "Make sure their profile picture clearly shows their face"
                    )
                    
                    SuggestionRow(
                        icon: "photo.on.rectangle",
                        text: "Check if they're actually in the photos you selected"
                    )
                }
            }
            .padding(.horizontal, 16)
            
            // Action buttons
            VStack(spacing: 12) {
                Button(action: {
                    // Reset and try again
                    appState.resetBatchCompare()
                }) {
                    HStack {
                        Image(systemName: "arrow.clockwise")
                        Text("Try Again")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.primaryColor)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 22))
                    .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
                
                Button(action: {
                    // Close modal
                    isPresented = false
                    appState.resetBatchCompare()
                }) {
                    Text("Close")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.neumorphicShadow.opacity(0.15))
                        .foregroundColor(Color.textColorPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: 22))
                        .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                }
            }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 32)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 16)
    }
}

// MARK: - Suggestion Row Component
struct SuggestionRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.primaryColorDark)
                .frame(width: 20)
            
            Text(text)
                .font(.body)
                .foregroundColor(.textColorSecondary)
                .multilineTextAlignment(.leading)
                .lineLimit(nil)
            
            Spacer()
        }
    }
} 