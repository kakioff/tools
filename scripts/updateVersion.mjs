import fs from 'fs';
import path from 'path';

/**
 * 更新 JSON 文件（package.json, tauri.conf.json等）
 */
function updateJsonFile(filePath, newVersion) {
  let content = fs.readFileSync(filePath, 'utf8');
  try {
    let json = JSON.parse(content);
    if (json.version) {
      json.version = newVersion;
    }
    const updatedContent = JSON.stringify(json, null, 2);
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`更新 ${filePath} 至版本 ${newVersion}`);
  } catch (err) {
    console.error(`解析 ${filePath} 失败: ${err}`);
  }
}

/**
 * 更新 Cargo.toml 文件中的版本号
 * 使用正则匹配类似 version = "..." 的内容进行替换
 */
function updateCargoToml(filePath, newVersion) {
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content.replace(/^version\s*=\s*"(.*?)"/gm, `version = "${newVersion}"`);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`更新 ${filePath} 至版本 ${newVersion}`);
}

// 获取命令行参数，新版本号作为第一个参数
if (process.argv.length < 3) {
  console.error('用法: node update-version.js <new_version>');
  process.exit(1);
}
const newVersion = process.argv[2];

// 需要更新的文件列表，可以根据需要添加其它文件
const filesToUpdate = [
  'package.json',
  'src-tauri/tauri.conf.json',
  'src-tauri/Cargo.toml'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`未找到 ${filePath}，跳过...`);
    return;
  }
  if (file.endsWith('.json')) {
    updateJsonFile(filePath, newVersion);
  } else if (file.endsWith('Cargo.toml')) {
    updateCargoToml(filePath, newVersion);
  }
});
