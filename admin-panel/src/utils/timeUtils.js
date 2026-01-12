export function formatDuration(seconds) {
    if (seconds === null || seconds === undefined) return "-";

    const total = Number(seconds);
    if (isNaN(total) || total < 0) return "-";

    const hrs = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    return [
        hrs.toString().padStart(2, "0"),
        mins.toString().padStart(2, "0"),
        secs.toString().padStart(2, "0")
    ].join(":");
}