export const http = (url: string): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const ct = "application/json";
    fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: {
        Accept: ct,
        "Content-Type": ct,
      },
    })
      .then((response: Response) => {
        if (response.ok) {
          resolve(response);
        } else {
          if (response.status != 200) {
            reject(response);
          } else {
            resolve(response);
          }
        }
      })
      .catch((error) => reject(error));
  });
};
