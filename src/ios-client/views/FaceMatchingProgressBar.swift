import SwiftUI

struct FaceMatchingProgressBar: View {
    let matchesAttempted: Int
    let totalTargetImages: Int
    
    private var progress: Double {
        guard totalTargetImages > 0 else { return 0.0 }
        return Double(matchesAttempted) / Double(totalTargetImages)
    }
    
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
                    .fill(Color.green)
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
        FaceMatchingProgressBar(matchesAttempted: 0, totalTargetImages: 5)
        FaceMatchingProgressBar(matchesAttempted: 2, totalTargetImages: 5)
        FaceMatchingProgressBar(matchesAttempted: 5, totalTargetImages: 5)
    }
    .padding(24)
} 