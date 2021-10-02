import axios from "axios";

export async function fetchEntries(filter) {
    const { data } = await axios.get(`/api/entries`, {
        params: filter
    });
    return data;
}