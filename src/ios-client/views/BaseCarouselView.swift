import SwiftUI

struct BaseCarouselView<T, Content>: View where T: Identifiable, Content: View {
    let items: [T]
    @Binding var currentIndex: Int
    let content: (T) -> Content

    var body: some View {
        VStack(spacing: 16) {
            if !items.isEmpty {
                HStack(alignment: .center, spacing: 0) {
                    // Left Arrow
                    Button(action: {
                        if currentIndex > 0 {
                            currentIndex -= 1
                        }
                    }) {
                        Image(systemName: "arrow.left.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(currentIndex > 0 ? Color.primaryColorDark : Color.neumorphicShadow)
                            .background(Circle().fill(Color.primaryColor.opacity(0.1)).frame(width: 48, height: 48))
                            .clipShape(Circle())
                            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                    }
                    .frame(width: 48, height: 160)
                    .disabled(currentIndex == 0)

                    // Content for current item
                    content(items[currentIndex])
                        .frame(width: 220, height: 220)

                    // Right Arrow
                    Button(action: {
                        if currentIndex < items.count - 1 {
                            currentIndex += 1
                        }
                    }) {
                        Image(systemName: "arrow.right.circle.fill")
                            .font(.system(size: 40))
                            .foregroundColor(currentIndex < items.count - 1 ? Color.primaryColorDark : Color.neumorphicShadow)
                            .background(Circle().fill(Color.primaryColor.opacity(0.1)).frame(width: 48, height: 48))
                            .clipShape(Circle())
                            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                    }
                    .frame(width: 48, height: 160)
                    .disabled(currentIndex == items.count - 1)
                }
                .frame(maxWidth: .infinity)
                // Index display below
                HStack {
                    Spacer()
                    Text("\(currentIndex + 1) of \(items.count)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                }
            }
        }
        .padding(.vertical, 8)
    }
} 