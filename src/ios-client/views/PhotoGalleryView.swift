import SwiftUI

struct PhotoGalleryView: View {
    let photos: [Photo]
    let isLoading: Bool
    let error: String?
    var loadMore: (() -> Void)? = nil
    var hasMore: Bool = false
    var emptyMessage: String? = nil
    @EnvironmentObject var appState: AppState
    @State private var didLog = false
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView("Loading photos...")
                    .padding()
            } else if let error = error {
                Text("Error loading photos: \(error)")
                    .foregroundColor(.red)
                    .padding()
            } else if photos.isEmpty {
                Text(emptyMessage ?? "No photos yet. Upload some memories!")
                    .foregroundColor(.textColorSecondary)
                    .padding()
            } else {
                GeometryReader { geometry in
                    let spacing: CGFloat = 2
                    let horizontalPadding: CGFloat = 12
                    let columns = Array(repeating: GridItem(.flexible(), spacing: spacing), count: 3)
                    let cellSize = (geometry.size.width - horizontalPadding * 2 - spacing * 2) / 3
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: spacing) {
                            ForEach(photos) { photo in
                                PhotoItemView(photo: photo, cellSize: cellSize)
                            }
                        }
                        .padding(.horizontal, horizontalPadding)
                        .padding(.vertical, spacing)
                        if hasMore, let loadMore = loadMore {
                            Button(action: loadMore) {
                                if isLoading {
                                    ProgressView()
                                } else {
                                    Text("Load More Photos")
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .padding(.vertical)
                        }
                    }
                }
                .onAppear {
                    if FeatureFlags.enableDebugLogPhotoGallery && !didLog {
                        print("[DEBUG][PhotoGallery] User: \(String(describing: appState.currentUser))")
                        print("[DEBUG][PhotoGallery] Photo count: \(photos.count)")
                        let urls = photos.map { $0.baseUrl }
                        print("[DEBUG][PhotoGallery] Photo URLs: \(urls)")
                        didLog = true
                    }
                }
            }
        }
        .background(Color.secondaryColor)
    }
}

#Preview {
    PhotoGalleryView(
        photos: Photo.mockPhotos,
        isLoading: false,
        error: nil,
        loadMore: {},
        hasMore: true,
        emptyMessage: "No photos yet. Upload some memories!"
    ).environmentObject(AppState())
} 