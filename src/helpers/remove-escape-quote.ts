export default function(string: string) {
    return string.replace(/(\\'|\\"|\\')/g, "'")
}