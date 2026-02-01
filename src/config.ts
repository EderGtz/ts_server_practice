//Hold the numberof requests received by the app
type APIConfig = {
    fileserverHits: number
}

//Hold stateful data
export let config: APIConfig = {
    fileserverHits: 0
}