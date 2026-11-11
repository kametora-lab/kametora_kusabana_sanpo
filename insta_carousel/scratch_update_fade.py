path = r'C:\Gravity\VIDEO_IROIRO\remotion_video\src\AmamiPlantsReel.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update schema: add "fade" to transitionType
text = text.replace(
    'transitionType: z.enum(["slide", "filmBurn"]).optional(),',
    'transitionType: z.enum(["slide", "filmBurn", "fade"]).optional(),'
)

# 2. Adjust transitionDuration if transitionType is fade (24 frames = 0.8s for smooth cross-dissolve)
text = text.replace(
    'const transitionDuration = 15; // 0.5秒 (30fps)',
    'const transitionDuration = props.transitionType === "slide" ? 15 : 24; // fade時は0.8秒(24fps)で滑らかに溶け合い'
)

# 3. Update presentation switch
old_block = """                {index < slides.length - 1 &&
                  (props.transitionType === "slide" ? (
                    <TransitionSeries.Transition
                      presentation={slide({ direction })}
                      timing={linearTiming({ durationInFrames: transitionDuration })}
                    />
                  ) : (
                    <TransitionSeries.Transition
                      presentation={filmBurn({ seed: index + 1 })}
                      timing={linearTiming({ durationInFrames: transitionDuration })}
                    />
                  ))}"""

new_block = """                {index < slides.length - 1 &&
                  (props.transitionType === "slide" ? (
                    <TransitionSeries.Transition
                      presentation={slide({ direction })}
                      timing={linearTiming({ durationInFrames: transitionDuration })}
                    />
                  ) : props.transitionType === "filmBurn" ? (
                    <TransitionSeries.Transition
                      presentation={filmBurn({ seed: index + 1 })}
                      timing={linearTiming({ durationInFrames: transitionDuration })}
                    />
                  ) : (
                    <TransitionSeries.Transition
                      presentation={fade()}
                      timing={linearTiming({ durationInFrames: transitionDuration })}
                    />
                  ))}"""

if old_block in text:
    text = text.replace(old_block, new_block)
    print("Replaced transitions block with fade support!")
else:
    print("Warning: old_block not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated AmamiPlantsReel.tsx with fade transition")
