import SwiftUI

struct MatchingTabsView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingUserSearchModal = false
    
    var onFindPhotos: () -> Void
    var onSendPhotos: () -> Void
    
    var body: some View {
        HStack(spacing: 20) {
            GoldActionButton(
                label: "Get photos of me",
                action: {
                    appState.batchCompareMode = .findPhotos
                    onFindPhotos()
                }
            )
            GoldActionButton(
                label: "Send photos to a friend",
                action: {
                    appState.batchCompareMode = .sendPhotos
                    showingUserSearchModal = true
                }
            )
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 16)
        .sheet(isPresented: $showingUserSearchModal) {
            UserSearchModal(isPresented: $showingUserSearchModal)
                .environmentObject(appState)
        }
    }
}

struct GoldActionButton: View {
    let label: String
    let action: () -> Void
    @State private var isPressed = false
    
    var goldGradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [Color.primaryColor, Color.primaryColorDark]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
    
    var body: some View {
        Button(action: action) {
            HStack {
                Spacer(minLength: 0)
                Text(label)
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                Spacer(minLength: 0)
            }
            .foregroundColor(.white)
            .frame(height: 54)
            .padding(.horizontal, 12)
            .padding(.vertical, 4)
            .background(
                Group {
                    if isPressed {
                        goldGradient.opacity(0.7)
                    } else {
                        goldGradient
                    }
                }
            )
            .cornerRadius(14)
            .shadow(color: Color.neumorphicShadow.opacity(isPressed ? 0.10 : 0.18), radius: isPressed ? 2 : 6, x: 0, y: isPressed ? 1 : 3)
            .scaleEffect(isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.18, dampingFraction: 0.7), value: isPressed)
            .frame(minWidth: 0, maxWidth: .infinity)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isPressed { isPressed = true }
                }
                .onEnded { _ in
                    isPressed = false
                }
        )
    }
}

#Preview {
    MatchingTabsView(onFindPhotos: {}, onSendPhotos: {})
} 