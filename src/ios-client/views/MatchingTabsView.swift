import SwiftUI

struct MatchingTabsView: View {
    var onFindPhotos: () -> Void
    var onSendPhotos: () -> Void
    
    var body: some View {
        HStack(spacing: 20) {
            GoldActionButton(
                label: "Find photos of me",
                action: onFindPhotos
            )
            GoldActionButton(
                label: "Send photos to a friend",
                action: onSendPhotos
            )
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 16)
    }
}

struct GoldActionButton: View {
    let label: String
    let action: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            HStack {
                Spacer(minLength: 0)
                Text(label)
                    .fontWeight(.semibold)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
                Spacer(minLength: 0)
            }
            .foregroundColor(isPressed ? Color.primaryColor : .white)
            .frame(height: 54)
            .background(isPressed ? Color.white : Color.primaryColor)
            .cornerRadius(22)
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
            .frame(minWidth: 0, maxWidth: .infinity)
        }
        .buttonStyle(.plain)
        .onLongPressGesture(minimumDuration: 0.01, pressing: { pressing in
            withAnimation(.easeInOut(duration: 0.12)) {
                isPressed = pressing
            }
        }, perform: {})
    }
}

#Preview {
    MatchingTabsView(onFindPhotos: {}, onSendPhotos: {})
} 