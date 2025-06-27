import SwiftUI

struct SkipAuthModal: View {
    @Binding var isPresented: Bool
    var onConfirm: () -> Void
    var onCancel: () -> Void
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Development Mode")
                        .font(.headline)
                        .padding(.leading)
                    Spacer()
                    Button(action: { isPresented = false }) {
                        Image(systemName: "xmark")
                            .foregroundColor(.secondary)
                            .padding(8)
                    }
                    .accessibilityLabel("Close")
                }
                .padding(.vertical, 12)
                .background(Color(.systemBackground))
                Divider()
                // Body
                VStack(spacing: 24) {
                    Text("Use test data instead of logging in?")
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding(.top, 24)
                    HStack(spacing: 16) {
                        Button(action: {
                            isPresented = false
                            onCancel()
                        }) {
                            Text("No, Log In")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.bordered)
                        Button(action: {
                            isPresented = false
                            onConfirm()
                        }) {
                            Text("Yes, Use Test Data")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                .padding([.horizontal, .bottom], 24)
                .background(Color(.systemBackground))
            }
            .frame(maxWidth: 340)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(radius: 16)
        }
    }
}

#Preview {
    SkipAuthModal(isPresented: .constant(true), onConfirm: {}, onCancel: {})
} 