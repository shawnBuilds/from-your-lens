import SwiftUI

struct TargetPhotosCarouselView: View {
    @Binding var photos: [Photo]
    @Binding var carouselIndex: Int
    
    var body: some View {
        BaseCarouselView(items: photos, currentIndex: $carouselIndex) { currentPhoto in
            AsyncImage(url: URL(string: currentPhoto.baseUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
            .frame(width: 220, height: 220)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(radius: 8)
        }
    }
} 