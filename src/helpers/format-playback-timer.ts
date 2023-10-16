export default function(sec: number) {
    const time = [];
    const hours = Math.floor(sec / (60 * 60));
    const minutes = hours > 0 ? Math.floor((sec / 60) % 60) : Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);

    if (hours > 0) time.push(hours);
    
    time.push(minutes);
    time.push(seconds);
    return time.map(n => String(n).padStart(2, "0")).join(":");
}