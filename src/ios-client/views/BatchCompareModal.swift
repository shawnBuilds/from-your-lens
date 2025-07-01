import SwiftUI

struct BatchCompareModal: View {
    @EnvironmentObject var appState: AppState
    @Binding var isPresented: Bool
    
    @State private var selectedSourcePhoto: Photo?
    @State private var selectedTargetPhotos: [Photo] = []
    @State private var showingSourcePhotoPicker = false
    @State private var showingTargetPhotoPicker = false
    
    // Auto-populate target photos when modal appears
    private var autoPopulatedTargetPhotos: [Photo] {
        let allPhotos = appState.photos
        let maxCount = FeatureFlags.defaultBatchTargetCount
        return Array(allPhotos.prefix(maxCount))
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
            ), maxSelection: 1, title: "Choose Source Photo")
        }
        .sheet(isPresented: $showingTargetPhotoPicker) {
            PhotoPickerView(selectedPhotos: $selectedTargetPhotos, maxSelection: 10, title: "Choose Target Photos")
        }
        .onAppear {
            // Auto-populate target photos when modal appears
            selectedTargetPhotos = autoPopulatedTargetPhotos
            
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[BatchCompareModal] Modal appeared with \(appState.batchCompareResults.count) batch compare results")
                for (index, result) in appState.batchCompareResults.enumerated() {
                    print("[BatchCompareModal] Result \(index): \(result.targetFileName), has photo: \(result.photo.baseUrl)")
                }
            }
        }
    }
}

// MARK: - Header Component
struct BatchCompareModalHeader: View {
    @Binding var isPresented: Bool
    let appState: AppState
    
    var body: some View {
        HStack {
            Text("Find Photos of You")
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
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Spacer()
                Text("Photo of You")
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
                    showingSourcePhotoPicker = true
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
            AsyncImage(url: URL(string: sourcePhoto.baseUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 80, height: 80)
            .clipShape(RoundedRectangle(cornerRadius: 8))
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
                Text("Choose Source Photo")
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
    let appState: AppState
    
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
    @State private var carouselIndex: Int = 0
    
    var matchingResults: [BatchCompareResult] {
        results.filter { !$0.faceMatches.isEmpty }
    }
    
    var body: some View {
        if !results.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                if !matchingResults.isEmpty {
                    BaseCarouselView(items: matchingResults, currentIndex: $carouselIndex) { result in
                        ZStack(alignment: .topTrailing) {
                            AsyncImage(url: URL(string: result.photo.baseUrl)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Rectangle()
                                    .fill(Color.gray.opacity(0.3))
                            }
                            .frame(width: 220, height: 220)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            
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
                            for (index, result) in matchingResults.enumerated() {
                                print("[BatchCompareModal] Result \(index): \(result.targetFileName), URL: \(result.photo.baseUrl)")
                            }
                        }
                    }
                } else {
                    Text("No matching images found.")
                        .font(.caption)
                        .foregroundColor(.textColorSecondary)
                        .padding(.vertical, 12)
                }
            }
        }
    }
}

// MARK: - Action Buttons Section
struct ActionButtonsSection: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    let appState: AppState
    @Binding var isPresented: Bool
    
    var body: some View {
        VStack(spacing: 12) {
            if selectedSourcePhoto != nil && !selectedTargetPhotos.isEmpty && !appState.isBatchComparing {
                Button(action: {
                    Task {
                        await appState.startBatchCompare(
                            sourcePhoto: selectedSourcePhoto!,
                            targetPhotos: selectedTargetPhotos
                        )
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
    let autoPopulatedPhotos: [Photo]
    let appState: AppState
    
    var body: some View {
        VStack(spacing: 24) {
            SourcePhotoSection(
                selectedSourcePhoto: $selectedSourcePhoto,
                showingSourcePhotoPicker: $showingSourcePhotoPicker
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
                        await appState.startBatchCompare(
                            sourcePhoto: selectedSourcePhoto!,
                            targetPhotos: selectedTargetPhotos
                        )
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
        }
    }
}

// MARK: - Matching State Content
struct MatchingStateContent: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    let appState: AppState
    
    var body: some View {
        VStack(spacing: 24) {
            // Show selected source photo
            if let sourcePhoto = selectedSourcePhoto {
                AsyncImage(url: URL(string: sourcePhoto.baseUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                }
                .frame(width: 80, height: 80)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            
            // Show target photos being processed
            VStack(alignment: .leading, spacing: 12) {
                Text("Processing Photos")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.textColorPrimary)
                
                TargetPhotosCarouselView(
                    photos: .constant(selectedTargetPhotos),
                    carouselIndex: .constant(0)
                )
            }
            
            // Progress bar
            FaceMatchingProgressBar(
                matchesAttempted: appState.matchesAttempted,
                totalTargetImages: selectedTargetPhotos.count
            )
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            
            // Progress text
            Text("Comparing photos... \(Int(appState.batchCompareProgress * 100))%")
                .font(.caption)
                .foregroundColor(.textColorSecondary)
        }
    }
}

// MARK: - Matched State Content
struct MatchedStateContent: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    let appState: AppState
    @Binding var isPresented: Bool
    
    var body: some View {
        VStack(spacing: 24) {
            // Results carousel
            if !appState.batchCompareResults.isEmpty {
                ResultsSection(results: appState.batchCompareResults)
            }
            
            // Action buttons
            VStack(spacing: 12) {
                // Confirm matches button
                let matchingResults = appState.batchCompareResults.filter { !$0.faceMatches.isEmpty }
                if !matchingResults.isEmpty {
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
                }
            }
        }
    }
}

// MARK: - Error State Content
struct ErrorStateContent: View {
    let selectedSourcePhoto: Photo?
    let selectedTargetPhotos: [Photo]
    let appState: AppState
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