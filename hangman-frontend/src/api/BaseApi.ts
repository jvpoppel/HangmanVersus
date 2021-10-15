export class BaseApi {
  // Implementation code where T is the returned data shape
  public post<T>(url: string, data: any): Promise<T> {
    if(data == undefined) {
      return fetch(url, {method: "POST"})
        .then(response => {
          return response.json();
        });
    }
    return fetch(url, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)})
      .then(response => {
        return response.json();
      });

  }

  public put<T>(url: string, data: any): Promise<T> {
    if(data == undefined) {
      return fetch(url, {method: "PUT"})
        .then(response => {
          return response.json();
        });
    }
    return fetch(url, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)})
      .then(response => {
        return response.json();
      });

  }

  public get<T>(url: string): Promise<T> {
    return fetch(url, {method: "GET"})
      .then(response => {
        return response.json();
      });
  }
}
