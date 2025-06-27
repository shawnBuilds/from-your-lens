import SwiftUI

struct HeaderView<TrailingContent: View>: View {
    var trailingContent: (() -> TrailingContent)?
    
    var body: some View {
        HStack {
            Text("From Your Lens")
                .font(.title2)
                .bold()
                .foregroundColor(.textColorPrimary)
            Spacer()
            if let trailingContent = trailingContent {
                trailingContent()
            }
        }
        .padding()
        .background(Color.clear)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(.primaryColor),
            alignment: .bottom
        )
    }
}

extension HeaderView where TrailingContent == EmptyView {
    init() {
        self.trailingContent = nil
    }
}

#Preview {
    HeaderView {
        Text("Test User")
    }
} 