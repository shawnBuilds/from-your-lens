import SwiftUI

struct AssetPreloadingView: View {
    @ObservedObject var assetPreloadingService: AssetPreloadingService
    let onPreloadingComplete: () -> Void
    
    @State private var showProgress = false
    
    var body: some View {
        ZStack {
            // Background
            Color.secondaryColor
                .ignoresSafeArea()
            
            VStack(spacing: 32) {
                // App logo/title
                VStack(spacing: 16) {
                    Text("From Your Lens")
                        .font(.system(size: 36, weight: .heavy))
                        .foregroundColor(.textColorPrimary)
                    
                    Text("Loading assets...")
                        .font(.title3)
                        .foregroundColor(.textColorSecondary)
                }
                
                // Progress indicator
                VStack(spacing: 16) {
                    // Progress bar
                    GeometryReader { geometry in
                        ZStack(alignment: .leading) {
                            // Background track
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 8)
                            
                            // Progress fill
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.primaryColorDark)
                                .frame(width: geometry.size.width * progressValue, height: 8)
                                .animation(.easeInOut(duration: 0.3), value: progressValue)
                        }
                    }
                    .frame(height: 8)
                    .frame(maxWidth: 280)
                    
                    // Progress text
                    Text(progressText)
                        .font(.caption)
                        .foregroundColor(.textColorSecondary)
                }
                
                // Loading animation
                HStack(spacing: 8) {
                    ForEach(0..<3) { index in
                        Circle()
                            .fill(Color.primaryColorDark)
                            .frame(width: 8, height: 8)
                            .scaleEffect(showProgress ? 1.2 : 0.8)
                            .animation(
                                Animation.easeInOut(duration: 0.6)
                                    .repeatForever()
                                    .delay(Double(index) * 0.2),
                                value: showProgress
                            )
                    }
                }
            }
            .padding(.horizontal, 40)
        }
        .onAppear {
            showProgress = true
        }
        .onChange(of: assetPreloadingService.preloadingState) { state in
            if case .completed = state {
                if FeatureFlags.enableDebugLogAssetPreloading {
                    print("[AssetPreloadingView] Preloading completed, calling onPreloadingComplete")
                }
                onPreloadingComplete()
            }
        }
    }
    
    // MARK: - Computed Properties
    private var progressValue: Double {
        switch assetPreloadingService.preloadingState {
        case .notStarted:
            return 0.0
        case .inProgress(let progress):
            return progress
        case .completed:
            return 1.0
        case .failed:
            return 0.0
        }
    }
    
    private var progressText: String {
        switch assetPreloadingService.preloadingState {
        case .notStarted:
            return "Preparing to load assets..."
        case .inProgress(let progress):
            let percentage = Int(progress * 100)
            let loadedCount = assetPreloadingService.loadedAssets.count
            let totalCount = assetPreloadingService.loadedAssets.count + assetPreloadingService.failedAssets.count
            return "Loading assets... \(percentage)% (\(loadedCount)/\(totalCount))"
        case .completed:
            return "Assets loaded successfully!"
        case .failed(let error):
            return "Failed to load assets: \(error.localizedDescription)"
        }
    }
}

#Preview {
    AssetPreloadingView(
        assetPreloadingService: AssetPreloadingService(),
        onPreloadingComplete: {}
    )
} 