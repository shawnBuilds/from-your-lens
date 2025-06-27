import SwiftUI

enum PhotoTabType: String, CaseIterable, Identifiable {
    case allPhotos = "All Photos"
    case photosOfYou = "Photos of You"
    
    var id: String { rawValue }
    var icon: String {
        switch self {
        case .allPhotos:
            return IconURLs.myDrive
        case .photosOfYou:
            return IconURLs.photosOfYou
        }
    }
}

struct PhotoTabsView: View {
    @Binding var selectedTab: PhotoTabType
    var onTabSelected: (PhotoTabType) -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(PhotoTabType.allCases) { tab in
                Button(action: {
                    selectedTab = tab
                    onTabSelected(tab)
                }) {
                    VStack(spacing: 4) {
                        AsyncImage(url: URL(string: tab.icon)) { phase in
                            switch phase {
                            case .success(let img):
                                img.resizable().frame(width: 28, height: 28)
                            default:
                                Color.gray.frame(width: 28, height: 28)
                            }
                        }
                        Text(tab.rawValue)
                            .font(.footnote)
                            .fontWeight(selectedTab == tab ? .bold : .regular)
                            .foregroundColor(selectedTab == tab ? Color.textColorPrimary : Color.textColorSecondary)
                    }
                    .padding(.vertical, 8)
                    .frame(maxWidth: .infinity)
                    .background(selectedTab == tab ? Color.primaryColorDark.opacity(0.18) : Color.clear)
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 4)
        .background(Color.secondaryColor)
        .cornerRadius(12)
        .padding(.horizontal, 8)
    }
}

#Preview {
    PhotoTabsView(selectedTab: .constant(.allPhotos), onTabSelected: { _ in })
} 