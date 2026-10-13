/** Two-digit index ("01"). Its own module so a page that only numbers things does not pull in the divisions' content. */
export const pad = (n: number) => String(n).padStart(2, "0");
