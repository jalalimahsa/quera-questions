/**
 * @param {number} seconds
 * @returns {Promise<void>}
 */
export function delay(seconds) {
    const { promise, resolve } = Promise.withResolvers();
    setTimeout(resolve, seconds * 1000);
    return promise;
}
