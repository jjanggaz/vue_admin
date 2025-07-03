export const request = async (
  path: string,
  params?: Record<string, string> | Record<string, string>[],
  options: RequestInit = { method: "GET" }
) => {
  try {
    const url = new URL("http://192.168.0.28:8092/fems" + path); //  서윤 PC IP
    // const url = new URL('http://210.91.59.80:8092/fems' + path) //  운영 외부 IP

    // Add params to the query string
    if (params) {
      if (Array.isArray(params)) {
        params.forEach((paramObj) => {
          Object.keys(paramObj).forEach((key) =>
            url.searchParams.append(key, paramObj[key])
          );
        });
      } else {
        Object.keys(params).forEach((key) =>
          url.searchParams.append(key, params[key])
        );
      }
    }

    const res = await fetch(url.toString(), options);
    if (!res.ok) {
      throw new Error(`API Call Fail: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
    } else {
      alert("An unexpected error occurred");
    }
  }
};
