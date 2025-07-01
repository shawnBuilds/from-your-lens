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
                    Image("google_logo") // Add Google logo asset to your project
                        .resizable()
                        .frame(width: 20, height: 20)
                        .foregroundColor(.white)
                }
                
                Text("Sign in with Google")
                    .font(.headline)
                    .foregroundColor(.white)
            }
            .padding(.vertical, 16)
            .padding(.horizontal, 24)
            .frame(maxWidth: .infinity)
            .background(
                LinearGradient(
                    gradient: Gradient(colors: [Color.blue, Color.blue.opacity(0.8)]),
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
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