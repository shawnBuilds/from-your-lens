import Foundation
import SwiftUI
import Combine

// MARK: - Asset Types
enum AssetType: String, CaseIterable {
    case galleryImage = "gallery_image"
    case avatar = "avatar"
    case icon = "icon"
    case arrow = "arrow"
}

// MARK: - Asset Definition
struct AssetDefinition: Identifiable, Hashable {
    let id: String
    let url: String
    let type: AssetType
    let priority: Int // Lower number = higher priority
    
    init(id: String, url: String, type: AssetType, priority: Int = 5) {
        self.id = id
        self.url = url
        self.type = type
        self.priority = priority
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: AssetDefinition, rhs: AssetDefinition) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Preloading State
enum PreloadingState {
    case notStarted
    case inProgress(progress: Double)
    case completed
    case failed(Error)
}

// MARK: - Asset Preloading Service
@MainActor
class AssetPreloadingService: ObservableObject {
    // MARK: - Published Properties
    @Published var preloadingState: PreloadingState = .notStarted
    @Published var loadedAssets: [String: UIImage] = [:]
    @Published var failedAssets: [String: Error] = [:]
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let imageCache = NSCache<NSString, UIImage>()
    private let session = URLSession.shared
    
    // MARK: - Asset Inventory
    private var assetInventory: [AssetDefinition] = []
    
    // MARK: - Initialization
    init() {
        setupAssetInventory()
        setupImageCache()
    }
    
    // MARK: - Setup
    private func setupAssetInventory() {
        // Gallery images (highest priority - visible immediately)
        assetInventory = [
            // Gallery images
            AssetDefinition(id: "gallery-3", url: "https://play.rosebud.ai/assets/jules-3-v3.jpg.png?6xGJ", type: .galleryImage, priority: 1),
            AssetDefinition(id: "gallery-2", url: "https://play.rosebud.ai/assets/jules-02.jpg?8JqA", type: .galleryImage, priority: 1),
            
            // Gallery avatars (high priority - visible with gallery)
            AssetDefinition(id: "friend-3-pfp", url: "https://play.rosebud.ai/assets/friend-3-pfp-v2.png?RfB4", type: .avatar, priority: 2),
            AssetDefinition(id: "friend-2-pfp", url: "https://play.rosebud.ai/assets/friend-2-v2.png?itRQ", type: .avatar, priority: 2),
            AssetDefinition(id: "jules-pfp", url: "https://rosebud.ai/assets/jules-pfp.jpg?zlHT", type: .avatar, priority: 2),
            
            // How it works icons (medium priority)
            AssetDefinition(id: "icon-invite", url: "https://play.rosebud.ai/assets/icon-invite.png?4HL1", type: .icon, priority: 3),
            AssetDefinition(id: "icon-share", url: "https://rosebud.ai/assets/icon-share.png?3ynl", type: .icon, priority: 3),
            AssetDefinition(id: "icon-image-add", url: "https://rosebud.ai/assets/icon-image-add.png?wXV4", type: .icon, priority: 3),
            
            // Arrow asset (medium priority)
            AssetDefinition(id: "white-arrow", url: "https://rosebud.ai/assets/arrow-white.png?EJbv", type: .arrow, priority: 3),
        ]
        
        // Sort by priority (lower number = higher priority)
        assetInventory.sort { $0.priority < $1.priority }
    }
    
    private func setupImageCache() {
        imageCache.countLimit = 50 // Maximum number of images to cache
        imageCache.totalCostLimit = 50 * 1024 * 1024 // 50MB limit
    }
    
    // MARK: - Public Methods
    func startPreloading() async {
        guard case .notStarted = preloadingState else {
            if FeatureFlags.enableDebugLogAssetPreloading {
                print("[AssetPreloadingService] Preloading already in progress or completed")
            }
            return
        }
        
        if FeatureFlags.enableDebugLogAssetPreloading {
            print("[AssetPreloadingService] Starting asset preloading for \(assetInventory.count) assets")
        }
        
        preloadingState = .inProgress(progress: 0.0)
        
        await preloadAssets()
    }
    
    func getImage(for assetId: String) -> UIImage? {
        // First check loaded assets
        if let image = loadedAssets[assetId] {
            return image
        }
        
        // Then check cache
        if let image = imageCache.object(forKey: assetId as NSString) {
            return image
        }
        
        return nil
    }
    
    func isAssetLoaded(_ assetId: String) -> Bool {
        return loadedAssets[assetId] != nil || imageCache.object(forKey: assetId as NSString) != nil
    }
    
    func clearCache() {
        imageCache.removeAllObjects()
        loadedAssets.removeAll()
        failedAssets.removeAll()
        preloadingState = .notStarted
    }
    
    // MARK: - Private Methods
    private func preloadAssets() async {
        let totalAssets = assetInventory.count
        var loadedCount = 0
        
        // Create a task group for concurrent loading
        await withTaskGroup(of: (String, UIImage?).self) { group in
            // Add tasks for each asset
            for asset in assetInventory {
                group.addTask {
                    return await self.loadAsset(asset)
                }
            }
            
            // Process results as they complete
            for await (assetId, image) in group {
                if let image = image {
                    self.loadedAssets[assetId] = image
                    self.imageCache.setObject(image, forKey: assetId as NSString)
                    
                    if FeatureFlags.enableDebugLogAssetPreloading {
                        print("[AssetPreloadingService] ✅ Loaded asset: \(assetId)")
                    }
                } else {
                    self.failedAssets[assetId] = NSError(domain: "AssetPreloadingService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to load asset"])
                    
                    if FeatureFlags.enableDebugLogAssetPreloading {
                        print("[AssetPreloadingService] ❌ Failed to load asset: \(assetId)")
                    }
                }
                
                loadedCount += 1
                let progress = Double(loadedCount) / Double(totalAssets)
                self.preloadingState = .inProgress(progress: progress)
            }
        }
        
        // Mark as completed
        preloadingState = .completed
        
        if FeatureFlags.enableDebugLogAssetPreloading {
            print("[AssetPreloadingService] 🎉 Asset preloading completed. Loaded: \(loadedAssets.count)/\(totalAssets)")
            if !failedAssets.isEmpty {
                print("[AssetPreloadingService] ⚠️ Failed assets: \(failedAssets.keys.joined(separator: ", "))")
            }
        }
    }
    
    private func loadAsset(_ asset: AssetDefinition) async -> (String, UIImage?) {
        guard let url = URL(string: asset.url) else {
            return (asset.id, nil)
        }
        
        do {
            let (data, response) = try await session.data(from: url)
            
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200,
                  let image = UIImage(data: data) else {
                return (asset.id, nil)
            }
            
            return (asset.id, image)
        } catch {
            if FeatureFlags.enableDebugLogAssetPreloading {
                print("[AssetPreloadingService] Error loading asset \(asset.id): \(error)")
            }
            return (asset.id, nil)
        }
    }
}

// MARK: - Feature Flag Extension
extension FeatureFlags {
    static let enableDebugLogAssetPreloading = true // Debug: log asset preloading operations
} 