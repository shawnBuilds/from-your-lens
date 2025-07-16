import SwiftUI

struct HowItWorksStep: Identifiable {
    let id = UUID()
    let iconUrl: String
    let text: String
    let bold: String?
    
    init(iconUrl: String, text: String, bold: String? = nil) {
        self.iconUrl = iconUrl
        self.text = text
        self.bold = bold
    }
}

struct HowItWorksSection: View {
    let steps: [HowItWorksStep]
    @Binding var loadingState: LandingViewLoadingState
    
    var body: some View {
        VStack(spacing: 16) {
            ForEach(steps) { step in
                HowItWorksStepView(
                    step: step,
                    loadingState: $loadingState
                )
                .frame(maxWidth: .infinity, minHeight: 60, maxHeight: 130)
            }
        }
        .padding(.horizontal, 20)
    }
}

struct HowItWorksStepView: View {
    let step: HowItWorksStep
    @Binding var loadingState: LandingViewLoadingState
    
    var body: some View {
        HStack(spacing: 18) {
            AsyncImage(url: URL(string: step.iconUrl)) { phase in
                switch phase {
                case .empty:
                    Color.gray.frame(width: 32, height: 32)
                        .onAppear {
                            loadingState.setHowItWorksIconLoading(step.iconUrl, isLoading: true)
                        }
                case .success(let img):
                    img.resizable()
                        .frame(width: 32, height: 32)
                        .onAppear {
                            loadingState.setHowItWorksIconLoading(step.iconUrl, isLoading: false)
                        }
                case .failure:
                    Color.gray.frame(width: 32, height: 32)
                        .onAppear {
                            loadingState.setHowItWorksIconLoading(step.iconUrl, isLoading: false)
                        }
                @unknown default:
                    Color.gray.frame(width: 32, height: 32)
                }
            }
            if let bold = step.bold {
                (
                    Text(step.text).foregroundColor(.textColorPrimary) +
                    Text(bold).bold().foregroundColor(.textColorPrimary)
                )
            } else {
                Text(step.text).foregroundColor(.textColorPrimary)
            }
        }
        .padding(.horizontal, 18)
        .frame(height: 64)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.secondaryColor)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.textColorPrimary, lineWidth: 2)
        )
        .cornerRadius(16)
    }
}

#Preview {
    HowItWorksSection(
        steps: [
            HowItWorksStep(iconUrl: "https://play.rosebud.ai/assets/icon-invite.png?4HL1", text: "Invite a ", bold: "friend"),
            HowItWorksStep(iconUrl: "https://rosebud.ai/assets/icon-share.png?3ynl", text: "They share ", bold: "photos"),
            HowItWorksStep(iconUrl: "https://rosebud.ai/assets/icon-image-add.png?wXV4", text: "Get the photos of ", bold: "you")
        ],
        loadingState: .constant(LandingViewLoadingState())
    )
} 