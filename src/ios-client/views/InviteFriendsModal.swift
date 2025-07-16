import SwiftUI

struct InviteFriendsModal: View {
    @EnvironmentObject var appState: AppState
    @Binding var isPresented: Bool
    @State private var loadingState = LandingViewLoadingState()
    @State private var showingShareSheet = false
    
    let inviteSteps: [HowItWorksStep] = [
        HowItWorksStep(iconUrl: "https://play.rosebud.ai/assets/icon-invite.png?4HL1", text: "Invite a ", bold: "friend"),
        HowItWorksStep(iconUrl: "https://rosebud.ai/assets/icon-share.png?3ynl", text: "They share ", bold: "photos"),
        HowItWorksStep(iconUrl: "https://rosebud.ai/assets/icon-image-add.png?wXV4", text: "Get the photos of ", bold: "you")
    ]
    
    var shareMessage: String {
        "Hey, I'm finding photos of me that are on my friends' phones. If you have some photos of me, this app will find and share them for you! Check it out. \(FeatureFlags.inviteAppLink)"
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Invite Friends")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.textColorPrimary)
                    .padding(.leading)
                Spacer()
                Button(action: { 
                    isPresented = false
                }) {
                    Image(systemName: "xmark")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textColorSecondary)
                        .frame(width: 44, height: 44)
                        .background(Color.primaryColor.opacity(0.12))
                        .clipShape(Circle())
                }
                .accessibilityLabel("Close")
                .padding(.trailing, 16)
            }
            .padding(.vertical, 28)
            .background(Color.secondaryColor)
            Divider()
            
            // Content
            ScrollView {
                VStack(spacing: 32) {
                    // Main content
                    VStack(spacing: 24) {
                        // Icon
                        VStack(spacing: 16) {
                            Image(systemName: "person.3.fill")
                                .font(.system(size: 64))
                                .foregroundColor(.primaryColor)
                        }
                        .padding(.horizontal, 24)
                        
                        // How it works section
                        HowItWorksSection(
                            steps: inviteSteps,
                            loadingState: $loadingState
                        )
                        .padding(.horizontal, 24)
                        
                        // Share button
                        Button(action: {
                            showingShareSheet = true
                        }) {
                            HStack {
                                Image(systemName: "square.and.arrow.up")
                                    .font(.system(size: 18, weight: .semibold))
                                Text("Share App")
                                    .font(.system(size: 18, weight: .semibold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.primaryColor)
                            .foregroundColor(.white)
                            .clipShape(RoundedRectangle(cornerRadius: 22))
                            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                        }
                        .padding(.horizontal, 24)
                    }
                }
                .padding(.vertical, 32)
            }
            .background(Color.secondaryColor)
        }
        .frame(maxWidth: 500, maxHeight: .infinity)
        .background(Color.secondaryColor)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 8, x: 0, y: 4)
        .sheet(isPresented: $showingShareSheet) {
            ShareSheet(activityItems: [shareMessage])
        }
    }
    

}

#Preview {
    InviteFriendsModal(isPresented: .constant(true))
        .environmentObject(AppState())
} 