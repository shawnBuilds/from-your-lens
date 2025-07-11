import SwiftUI

struct FaceMatchingProgressBar: View {
    let progress: Double
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background track
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 16)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                
                // Progress fill
                Rectangle()
                    .fill(Color.textColorPrimary)
                    .frame(width: geometry.size.width * progress, height: 16)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .animation(.easeInOut(duration: 0.3), value: progress)
            }
        }
        .frame(height: 16)
    }
}

#Preview {
    VStack(spacing: 24) {
        FaceMatchingProgressBar(progress: 0.0)
        FaceMatchingProgressBar(progress: 0.4)
        FaceMatchingProgressBar(progress: 1.0)
    }
    .padding(24)
} 