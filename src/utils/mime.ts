const SUPPORTED = {
    image: new Set([
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/apng",
        "image/avif",
        "image/bmp",
    ]),
    audio: new Set(["audio/mpeg", "audio/ogg", "audio/webm", "audio/wav", "audio/aac"]),
    video: new Set(["video/mp4", "video/webm", "video/ogg"]),
};

function isImage(mime: string) {
    return SUPPORTED.image.has(mime);
}

function isVideo(mime: string) {
    return SUPPORTED.video.has(mime);
}

function isAudio(mime: string) {
    return SUPPORTED.audio.has(mime);
}

export function getMimeCategory(mime: string) {
    if (isImage(mime)) return "image";
    if (isVideo(mime)) return "video";
    if (isAudio(mime)) return "audio";
    return "other";
}
