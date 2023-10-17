export default function (data: Record<string, unknown> | Array<unknown>) {
    return JSON.parse(JSON.stringify(data));
}