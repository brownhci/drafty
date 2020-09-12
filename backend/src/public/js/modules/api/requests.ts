/**
 * Issues a simple GET fetch call to drafty server. Parses the returned result as JSON.
 *
 * @param {string} url - Endpoint to request from.
 * @returns Null if request fails, the decoded JSON data otherwise.
 */
export async function getJSON(url: string) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Network error when communicating to ${url}`, error);
      return null;
    }
}
