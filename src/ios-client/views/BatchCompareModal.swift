import SwiftUI

struct BatchCompareModal: View {
    @EnvironmentObject var appState: AppState
    @Binding var isPresented: Bool
    
    @State private var selectedSourcePhoto: Photo?
    @State private var selectedTargetPhotos: [Photo] = []
    @State private var showingSourcePhotoPicker = false
    @State private var showingTargetPhotoPicker = false
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                BatchCompareModalHeader(isPresented: $isPresented, appState: appState)
                
                ScrollView {
                    VStack(spacing: 24) {
                        SourcePhotoSection(
                            selectedSourcePhoto: $selectedSourcePhoto,
                            showingSourcePhotoPicker: $showingSourcePhotoPicker
                        )
                        
                        TargetPhotosSection(
                            selectedTargetPhotos: $selectedTargetPhotos,
                            showingTargetPhotoPicker: $showingTargetPhotoPicker
                        )
                        
                        ProgressSection(appState: appState)
                        
                        ErrorSection(error: appState.batchCompareError)
                        
                        ResultsSection(results: appState.batchCompareResults)
                        
                        ActionButtonsSection(
                            selectedSourcePhoto: selectedSourcePhoto,
                            selectedTargetPhotos: selectedTargetPhotos,
                            appState: appState,
                            isPresented: $isPresented
                        )
                    }
                    .padding(24)
                }
                .background(Color(.systemBackground))
            }
            .frame(maxWidth: 500, maxHeight: 600)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(radius: 16)
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
    }
}

// MARK: - Header Component
struct BatchCompareModalHeader: View {
    @Binding var isPresented: Bool
    let appState: AppState
    
    var body: some View {
        HStack {
            Text("Find Photos of You")
                .font(.headline)
                .padding(.leading)
            Spacer()
            Button(action: { 
                isPresented = false
                appState.resetBatchCompare()
            }) {
                Image(systemName: "xmark")
                    .foregroundColor(.secondary)
                    .padding(8)
            }
            .accessibilityLabel("Close")
        }
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
        Divider()
    }
}

// MARK: - Source Photo Section
struct SourcePhotoSection: View {
    @Binding var selectedSourcePhoto: Photo?
    @Binding var showingSourcePhotoPicker: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Photo of You")
                .font(.subheadline)
                .fontWeight(.semibold)
            
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
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Selected Source Photo")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text(sourcePhoto.mediaItemId)
                    .font(.caption)
                    .lineLimit(1)
            }
            
            Spacer()
            
            Button("Change", action: onChange)
                .font(.caption)
                .foregroundColor(.blue)
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
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}

// MARK: - Target Photos Section
struct TargetPhotosSection: View {
    @Binding var selectedTargetPhotos: [Photo]
    @Binding var showingTargetPhotoPicker: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Photos to Search")
                .font(.subheadline)
                .fontWeight(.semibold)
            
            if !selectedTargetPhotos.isEmpty {
                TargetPhotosListView(selectedTargetPhotos: $selectedTargetPhotos)
                
                Button("Add More Photos") {
                    showingTargetPhotoPicker = true
                }
                .font(.caption)
                .foregroundColor(.blue)
            } else {
                TargetPhotoPickerButton {
                    showingTargetPhotoPicker = true
                }
            }
        }
    }
}

struct TargetPhotosListView: View {
    @Binding var selectedTargetPhotos: [Photo]
    
    var body: some View {
        VStack(spacing: 8) {
            ForEach(selectedTargetPhotos, id: \.id) { photo in
                TargetPhotoItemView(photo: photo) {
                    selectedTargetPhotos.removeAll { $0.id == photo.id }
                }
            }
        }
    }
}

struct TargetPhotoItemView: View {
    let photo: Photo
    let onRemove: () -> Void
    
    var body: some View {
        HStack {
            AsyncImage(url: URL(string: photo.baseUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 60, height: 60)
            .clipShape(RoundedRectangle(cornerRadius: 6))
            
            VStack(alignment: .leading, spacing: 2) {
                Text(photo.mediaItemId)
                    .font(.caption)
                    .lineLimit(1)
                Text("\(photo.width ?? 0) × \(photo.height ?? 0)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Button(action: onRemove) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.red)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.gray.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 6))
    }
}

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
            .background(Color.green.opacity(0.1))
            .foregroundColor(.green)
            .clipShape(RoundedRectangle(cornerRadius: 8))
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
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.blue.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}

// MARK: - Error Section
struct ErrorSection: View {
    let error: String?
    
    var body: some View {
        if let error = error {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(.orange)
                    Text("Comparison Issues")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                }
                
                Text(error)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color.orange.opacity(0.1))
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}

// MARK: - Results Section
struct ResultsSection: View {
    let results: [BatchCompareResult]
    
    var body: some View {
        if !results.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("Results")
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                let matchingResults = results.filter { !$0.faceMatches.isEmpty }
                let totalResults = results.count
                
                VStack(spacing: 8) {
                    HStack {
                        Text("Found \(matchingResults.count) matching photos")
                            .font(.caption)
                            .foregroundColor(.green)
                        Spacer()
                        Text("of \(totalResults) total")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    ForEach(results, id: \.targetFileName) { result in
                        ResultItemView(result: result)
                    }
                }
            }
        }
    }
}

struct ResultItemView: View {
    let result: BatchCompareResult
    
    var body: some View {
        HStack {
            Text(result.targetFileName)
                .font(.caption)
                .lineLimit(1)
            
            Spacer()
            
            if result.rejected {
                Text("Failed to load")
                    .font(.caption2)
                    .foregroundColor(.red)
            } else if !result.faceMatches.isEmpty {
                Text("Match (\(Int(result.faceMatches.first?.similarity ?? 0))%)")
                    .font(.caption2)
                    .foregroundColor(.green)
            } else {
                Text("No match")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color.gray.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 4))
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
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
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
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
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