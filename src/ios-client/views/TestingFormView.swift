import SwiftUI

struct TestingFormView: View {
    var body: some View {
        VStack {
            Text("Testing Form")
                .font(.largeTitle)
            Text("This view will be implemented later")
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

#Preview {
    TestingFormView()
} 