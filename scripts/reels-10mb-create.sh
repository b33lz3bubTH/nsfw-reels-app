
#!/bin/bash
# Script to split videos by filesize using ffmpeg

if [ $# -ne 3 ]; then
    echo "Illegal number of parameters. Needs 3 parameters:"
    echo "Usage:"
    echo "./split-video.sh FILE SIZELIMIT 'FFMPEG_ARGS'"
    echo
    echo "Parameters:"
    echo "    - FILE:        Name of the video file to split"
    echo "    - SIZELIMIT:   Maximum file size of each part (in bytes)"
    echo "    - FFMPEG_ARGS: Additional arguments to pass to each ffmpeg-call"
    echo "                   (e.g., video format and quality options)"
    exit 1
fi

FILE="$1"
SIZELIMIT="$2"
FFMPEG_ARGS="$3"

# Ensure ffprobe and ffmpeg are installed
if ! command -v ffprobe &>/dev/null || ! command -v ffmpeg &>/dev/null; then
    echo "Error: ffprobe and ffmpeg must be installed to use this script."
    exit 1
fi

# Get total duration of the source video
DURATION=$(ffprobe -i "$FILE" -show_entries format=duration -v quiet -of csv="p=0" | cut -d. -f1)

# Set variables for iteration
CUR_DURATION=0
BASENAME="${FILE%.*}"  # Filename without extension
EXTENSION="mp4"        # Output format
i=1                    # Part counter

# Output folder
OUTPUT_DIR="splitted_vids"
mkdir -p "$OUTPUT_DIR"

echo "Source video duration: $DURATION seconds"

# Loop to split the video
while [[ $CUR_DURATION -lt $DURATION ]]; do
    OUTPUT_FILE="$OUTPUT_DIR/${BASENAME}_part_$i.$EXTENSION"
    echo "Processing part $i starting at $CUR_DURATION seconds"

    # Create the next part using ffmpeg
    ffmpeg -ss "$CUR_DURATION" -i "$FILE" -fs "$SIZELIMIT" $FFMPEG_ARGS -y "$OUTPUT_FILE"

    # Get the duration of the created part
    PART_DURATION=$(ffprobe -i "$OUTPUT_FILE" -show_entries format=duration -v quiet -of csv="p=0" | cut -d. -f1)

    # Update the current duration
    CUR_DURATION=$((CUR_DURATION + PART_DURATION))

    echo "Created $OUTPUT_FILE (Duration: $PART_DURATION seconds)"
    i=$((i + 1))
done

echo "Splitting complete. Files saved in $OUTPUT_DIR"

# ~/Documents/pr-reels/scripts/reels-10mb-create.sh Video.mp4 9500000 "-c:v libx264 -crf 23 -c:a copy"
