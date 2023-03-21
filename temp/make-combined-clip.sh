ffmpeg -i test-clips/input/prores.mov -c:v libvpx -pix_fmt yuva420p -crf 10 -vf scale=1280:720 -auto-alt-ref 0 -an test-clips/output/crf-10.webm
ffmpeg -i test-clips/input/prores.mov -c:v libvpx -pix_fmt yuva420p -r 30 -crf 10 -auto-alt-ref 0 -an ./test-clips/output/crf-10.webm


ffmpeg \
  -i shady-nightclub-dancing-freestyle-1.mov \
  -i shady-nightclub-dancing-freestyle-2.mov \
  -i shady-nightclub-dancing-freestyle-3.mov \
  -i shady-nightclub-dancing-freestyle-4.mov \
  -filter_complex " \
    xstack=grid=2x2[a];[a]scale=720:1280[out]" \
  -map "[out]" \
  -c:v libvpx -pix_fmt yuva420p -crf 10 -b:v 50M -auto-alt-ref 0 -threads 4 -an _shady_4square2.webm



ffmpeg \
  -i shady-nightclub-dancing-freestyle-1.mov \
  -i shady-nightclub-dancing-freestyle-2.mov \
  -i shady-nightclub-dancing-freestyle-3.mov \
  -i shady-nightclub-dancing-freestyle-4.mov \
  -i shady-nightclub-dancing-freestyle-5.mov \
  -i shady-nightclub-dancing-freestyle-6.mov \
  -filter_complex " \
    [0:v] scale=360:480 [a0]; \
    [1:v] scale=360:480 [a1]; \
    [2:v] scale=360:480 [a2]; \
    [3:v] scale=360:480 [a3]; \
    [4:v] scale=360:480 [a4]; \
    [5:v] scale=360:480 [a5]; \
    [a0][a1][a2][a3][a4][a5]xstack=grid=3x2[out]" \
  -map "[out]" \
  -c:v libvpx -pix_fmt yuva420p -crf 30 -b:v 50M -auto-alt-ref 0 -threads 4 -an ../gloxinia-done/_shady_6square.webm
