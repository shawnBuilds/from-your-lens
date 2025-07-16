import SwiftUI
import Photos

struct PhotoItemView: View {
    let photo: Photo
    let cellSize: CGFloat
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        ZStack {
            if let s3Url = photo.s3Url, !s3Url.isEmpty {
                // Handle S3 photos (shared photos)
                let _ = print("[PhotoItemView] 📸 Using S3 URL: \(s3Url)")
                AsyncImage(url: URL(string: s3Url)) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: cellSize, height: cellSize)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: cellSize, height: cellSize)
                            .clipped()
                            .cornerRadius(8)
                    case .failure(let error):
                        let _ = print("[PhotoItemView] ❌ S3 image load failed: \(error)")
                        VStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.red)
                                .font(.largeTitle)
                            Text("Failed to load")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(width: cellSize, height: cellSize)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    @unknown default:
                        EmptyView()
                    }
                }
            } else if photo.baseUrl.hasPrefix("icloud://") {
                // Handle iCloud photos
                ICloudPhotoView(photo: photo, cellSize: cellSize)
            } else {
                // Handle regular network photos
                AsyncImage(url: URL(string: photo.baseUrl)) { phase in
                    switch phase {
                    case .empty:
                        ProgressView()
                            .frame(width: cellSize, height: cellSize)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: cellSize, height: cellSize)
                            .clipped()
                            .cornerRadius(8)
                    case .failure(let error):
                        let _ = print("[PhotoItemView] ❌ Regular image load failed: \(error)")
                        VStack {
                            Image(systemName: "exclamationmark.triangle")
                                .foregroundColor(.red)
                                .font(.largeTitle)
                            Text("Failed to load")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(width: cellSize, height: cellSize)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    @unknown default:
                        EmptyView()
                    }
                }
            }
        }
        .frame(width: cellSize, height: cellSize)
        .accessibilityLabel(photo.altText ?? "Photo")
        .overlay(
            // Download button for S3 photos
            Group {
                if let s3Url = photo.s3Url, !s3Url.isEmpty {
                    VStack {
                        Spacer()
                        HStack {
                            Spacer()
                            Button(action: {
                                Task {
                                    await appState.downloadSinglePhotoToLibrary(photo)
                                }
                            }) {
                                Image(systemName: "arrow.down.circle.fill")
                                    .foregroundColor(.white)
                                    .font(.system(size: 20))
                                    .background(Color.black.opacity(0.6))
                                    .clipShape(Circle())
                            }
                            .buttonStyle(.plain)
                            .padding(4)
                        }
                    }
                }
            }
        )
    }
}

// MARK: - iCloud Photo View
struct ICloudPhotoView: View {
    let photo: Photo
    let cellSize: CGFloat
    @State private var image: UIImage?
    @State private var isLoading = true
    @State private var loadError = false
    
    var body: some View {
        Group {
            if isLoading {
                ProgressView()
                    .frame(width: cellSize, height: cellSize)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            } else if let image = image {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
                    .frame(width: cellSize, height: cellSize)
                    .clipped()
                    .cornerRadius(8)
            } else if loadError {
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .foregroundColor(.red)
                        .font(.largeTitle)
                    Text("Failed to load")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(width: cellSize, height: cellSize)
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
        }
        .onAppear {
            loadICloudPhoto()
        }
    }
    
    private func loadICloudPhoto() {
        Task {
            do {
                let iCloudService = ICloudPhotoService()
                if let asset = try await iCloudService.getPhotoAsset(for: photo) {
                    let targetSize = CGSize(width: cellSize * 2, height: cellSize * 2) // Request higher resolution
                    if let loadedImage = try await iCloudService.loadImageFromAsset(asset, targetSize: targetSize) {
                        await MainActor.run {
                            self.image = loadedImage
                            self.isLoading = false
                        }
                    } else {
                        await MainActor.run {
                            self.loadError = true
                            self.isLoading = false
                        }
                    }
                } else {
                    await MainActor.run {
                        self.loadError = true
                        self.isLoading = false
                    }
                }
            } catch {
                await MainActor.run {
                    self.loadError = true
                    self.isLoading = false
                }
            }
        }
    }
}

#Preview {
    PhotoItemView(photo: Photo.mock, cellSize: 140)
} 