import { API_BASE_URL } from "../config/apiConfig";

const response = await fetch(`${API_BASE_URL}/route/all`);
const allRoutes = await response.json();
console.log(allRoutes);

export const exampleData = allRoutes.items.map((route, index) => {
  return {
    busId: ++index,
    route,
  };
});
