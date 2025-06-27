import SwiftUI
import Photos

struct PhotoItemView: View {
    let photo: Photo
    let cellSize: CGFloat
    
    var body: some View {
        ZStack {
            if photo.baseUrl.hasPrefix("icloud://") {
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
                    case .failure:
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