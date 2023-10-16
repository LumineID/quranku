export default function(path: string | null = null, query: Record<string, string> = {}) {
    path = (path || window.location.href);
    
    try {
        const url = new URL(path);
        path = url.href.slice(url.origin.length);
    } catch (e) {
        //
    }

    path = path.replace(/(^[\\/]+|[\\/]+$)/g, "");

    const url = new URL([window.location.origin, path].join("/"));
    const [href, currentQuery] = url.href.split("?");

    if (currentQuery) {
        query = {
            ...Object.fromEntries(new URLSearchParams(currentQuery)),
            ...query
        }
    }

    const queryString = new URLSearchParams(query).toString();
    window.history.replaceState({}, "", [href, queryString].filter(v => v.trim()).join("?"));
}