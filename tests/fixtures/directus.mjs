import { createServer } from "node:http";
createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:8056");
  res.setHeader("Content-Type", "application/json");
  if (url.pathname === "/") {
    res.end("{}");
    return;
  }
  if (
    req.method !== "GET" ||
    req.headers.authorization !== "Bearer test-read-token" ||
    !url.searchParams.has("fields") ||
    url.searchParams.get("sort") !== "sort,name,id"
  ) {
    res.writeHead(403);
    res.end("{}");
    return;
  }
  const foods = url.pathname === "/items/foods";
  if (foods && url.searchParams.get("filter[active][_eq]") !== "true") {
    res.writeHead(400);
    res.end("{}");
    return;
  }
  const page = Number(url.searchParams.get("page"));
  // Páginas curtas verificam paginação mesmo com limite imposto pelo servidor.
  const data = foods
    ? page === 1
      ? [
          {
            id: 1,
            name: "Ovo cozido",
            unit: "unidade",
            default_quantity: "1.5",
            icon_name: "Egg",
            active: true,
            sort: 1,
          },
        ]
      : page === 2
        ? [
            {
              id: 2,
              name: "Café",
              unit: "ml",
              default_quantity: 150,
              active: true,
              sort: 2,
            },
          ]
        : []
    : page === 1
      ? [{ id: 1, name: "Café da manhã", icon_name: "Sunrise", sort: 1 }]
      : [];
  res.end(JSON.stringify({ data }));
}).listen(8056, "127.0.0.1");
