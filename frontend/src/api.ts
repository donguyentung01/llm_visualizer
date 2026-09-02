const BASE =  "http://localhost:8000";

export async function postJSON(path: string, body: unknown) {
    const res = await fetch(BASE + path, {
        method: "POST", 
        headers: {"content-type": "application/json"}, 
        body: JSON.stringify(body), 
    }); 
    if (!res.ok) { 
        throw new Error(`${path} -> ${res.status}`);
    }
    return res.json(); 
}