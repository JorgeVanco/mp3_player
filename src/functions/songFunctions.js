const pauseSong = (e, audioRef, setIsPaused) => {
    e.stopPropagation();
    audioRef.pause()
    setIsPaused(true)
}

const playSong = (e, audioRef, setIsPaused) => {
    e.stopPropagation();
    audioRef.play()
    setIsPaused(false)

}

export {playSong, pauseSong}