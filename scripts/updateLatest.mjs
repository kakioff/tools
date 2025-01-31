import { readFile, writeFile } from "node:fs/promises";

const file = await readFile("latest.json", { encoding: "utf-8" });
const data = JSON.parse(file);
for (let platform in data.platforms) {
  let url = data.platforms[platform].url;
  data.platforms[platform].url = url.replace(
    "https://github.com/kakioff/tools/releases/download",
    "http://101.34.60.162:9080/apps/tools"
  );
}

// 可以根据需要修改 data
await writeFile("latest.json", JSON.stringify(data, null, 2));
