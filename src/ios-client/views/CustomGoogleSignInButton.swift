import SwiftUI
import GoogleSignInSwift

struct CustomGoogleSignInButton: View {
    let action: () -> Void
    let isLoading: Bool
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    AsyncImage(url: URL(string: "https://rosebud.ai/assets/google_icon.webp?phu5")) { phase in
                        if let image = phase.image {
                            image
                                .resizable()
                                .renderingMode(.template)
                                .foregroundColor(Color.textColorPrimary)
                                .frame(width: 30, height: 30)
                        } else {
                            Color.clear.frame(width: 30, height: 30)
                        }
                    }
                }
                
                Text("Continue with Google")
                    .font(.headline)
                    .foregroundColor(.white)
            }
            .padding(.vertical, 16)
            .padding(.horizontal, 24)
            .frame(maxWidth: .infinity)
            .background(Color.primaryColor)
            .cornerRadius(25)
            .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
        }
        .disabled(isLoading)
    }
}

#Preview {
    VStack(spacing: 20) {
        CustomGoogleSignInButton(action: {}, isLoading: false)
        CustomGoogleSignInButton(action: {}, isLoading: true)
    }
    .padding()
} 