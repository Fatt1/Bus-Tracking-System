const BASE_URL = "https://localhost:7229/api";
const response = await fetch(BASE_URL + "/v1/route/all");
const allRoutes = await response.json();
console.log(allRoutes);

export const exampleData = allRoutes.items.map((route, index) => {
  return {
    busId: ++index,
    route,
  };
});
