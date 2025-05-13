export const getErrorString = (error: unknown): string => {
    let message = "Unknown error occurred";

    console.log("Error: ", error)

    if (error && typeof error === "object" && "response" in error) {
        message = String((error as { response: { data: string } }).response.data);
    }

    return message
}
