import { readFile, copyFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const targetDir = join(import.meta.dirname, "../", "publish");

const publish = async () => {
  await mkdir(targetDir, { recursive: true });

  const file = await readFile("latest.json", { encoding: "utf-8" });
  const data = JSON.parse(file);
  // 可以根据需要修改 data
  await writeFile(
    join(targetDir, "latest.json"),
    JSON.stringify(data, null, 2)
  );
};

publish();