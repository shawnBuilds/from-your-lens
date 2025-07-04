import SwiftUI

struct TargetPhotosCarouselView: View {
    @Binding var photos: [Photo]
    @Binding var carouselIndex: Int
    
    var body: some View {
        BaseCarouselView(items: photos, currentIndex: $carouselIndex) { currentPhoto in
            BatchComparePhotoView(photo: currentPhoto, size: 220)
                .id(currentPhoto.id)
        }
        .onAppear {
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[TargetPhotosCarouselView] onAppear: photos count=\(photos.count)")
                for (i, p) in photos.enumerated() {
                    print("[TargetPhotosCarouselView] photos[\(i)]: id=\(p.id), url=\(p.baseUrl)")
                }
            }
        }
        .onChange(of: photos) { newPhotos in
            if FeatureFlags.enableDebugBatchCompareModal {
                print("[TargetPhotosCarouselView] photos changed: count=\(newPhotos.count)")
                for (i, p) in newPhotos.enumerated() {
                    print("[TargetPhotosCarouselView] photos[\(i)]: id=\(p.id), url=\(p.baseUrl)")
                }
            }
        }
    }
} 