export default function (data: Record<any, unknown> | Array<unknown>) {
    return JSON.parse(JSON.stringify(data));
}