import { useEffect, useRef } from "react";

export default function YouTubePlayer({ videoId, playing }) {
    const playerRef = useRef(null);

    useEffect(() => {
        function createPlayer() {
            if (playerRef.current) return;
            playerRef.current = new window.YT.Player("yt-player", {
                videoId,
                playerVars: {
                    playsinline: 1,
                    controls: 1,
                },
            });
        }

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            window.onYouTubeIframeAPIReady = createPlayer;
        }
    }, [videoId]);

    useEffect(() => {
        if (!playerRef.current) return;
        if (playing) {
            playerRef.current.playVideo();
        } else {
            playerRef.current.pauseVideo();
        }
    }, [playing]);

    return (
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <div id="yt-player" className="absolute inset-0 w-full h-full"></div>
        </div>
    );
}
