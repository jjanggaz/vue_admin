import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// i18n JSON 파일 읽기
const koJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/i18n/language/ko.json"), "utf8")
);
const enJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/i18n/language/en.json"), "utf8")
);

// 모든 Vue 파일 찾기
function findVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findVueFiles(filePath, fileList);
    } else if (file.endsWith(".vue")) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Vue 파일에서 다국어 코드 추출
function extractI18nCodes(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const codes = new Set();

  // 모든 t("...") 또는 t('...') 패턴 찾기 (더 포괄적으로)
  const tPattern = /t\(["']([^"']+)["']\)/g;
  let match;
  while ((match = tPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // 모든 $t("...") 또는 $t('...') 패턴 찾기
  const dollarTPattern = /\$t\(["']([^"']+)["']\)/g;
  while ((match = dollarTPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // alert(t("...")) 패턴 찾기
  const alertPattern = /alert\s*\(\s*t\(["']([^"']+)["']\)/g;
  while ((match = alertPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // confirm(t("...")) 패턴 찾기
  const confirmPattern = /confirm\s*\(\s*t\(["']([^"']+)["']\)/g;
  while ((match = confirmPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // alert($t("...")) 패턴 찾기
  const alertDollarPattern = /alert\s*\(\s*\$t\(["']([^"']+)["']\)/g;
  while ((match = alertDollarPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // confirm($t("...")) 패턴 찾기
  const confirmDollarPattern = /confirm\s*\(\s*\$t\(["']([^"']+)["']\)/g;
  while ((match = confirmDollarPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // 템플릿 내부 {{ t("...") }} 패턴
  const templatePattern = /\{\{\s*t\(["']([^"']+)["']\)\s*\}\}/g;
  while ((match = templatePattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // 템플릿 내부 {{ $t("...") }} 패턴
  const templateDollarPattern = /\{\{\s*\$t\(["']([^"']+)["']\)\s*\}\}/g;
  while ((match = templateDollarPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // 변수 할당 패턴: const x = t("...") 또는 let x = t("...")
  const varPattern = /(?:const|let|var)\s+\w+\s*=\s*t\(["']([^"']+)["']\)/g;
  while ((match = varPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // 객체 속성 패턴: title: t("...")
  const objPattern = /\w+:\s*t\(["']([^"']+)["']\)/g;
  while ((match = objPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  // 배열 요소 패턴: [t("...")]
  const arrayPattern = /\[t\(["']([^"']+)["']\)\]/g;
  while ((match = arrayPattern.exec(content)) !== null) {
    codes.add(match[1]);
  }

  return Array.from(codes);
}

// 중첩된 객체에서 값 가져오기
function getNestedValue(obj, key) {
  const keys = key.split(".");
  let value = obj;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  return value;
}

// 화면명 추출 (파일 경로에서)
function getScreenName(filePath) {
  const relativePath = path.relative(
    path.join(__dirname, "../src/views"),
    filePath
  );
  const dirName = path.dirname(relativePath);
  const fileName = path.basename(relativePath, ".vue");

  if (dirName === ".") {
    return fileName;
  }
  return `${dirName}/${fileName}`;
}

// 메인 처리
const vueFiles = findVueFiles(path.join(__dirname, "../src/views"));
const allData = [];

vueFiles.forEach((filePath) => {
  const screenName = getScreenName(filePath);
  const codes = extractI18nCodes(filePath);

  // validation 또는 messages로 시작하는 코드만 필터링
  const filteredCodes = codes.filter(
    (code) => code.startsWith("validation.") || code.startsWith("messages.")
  );

  filteredCodes.forEach((code, index) => {
    const koValue = getNestedValue(koJson, code);
    const enValue = getNestedValue(enJson, code);

    allData.push({
      screenName,
      index: index + 1,
      code,
      koValue: koValue || "",
      enValue: enValue || "",
    });
  });
});

// 화면별로 정렬
allData.sort((a, b) => {
  if (a.screenName !== b.screenName) {
    return a.screenName.localeCompare(b.screenName);
  }
  return a.index - b.index;
});

// 엑셀 파일 생성
const workbook = XLSX.utils.book_new();

// 한글 시트
const koData = allData.map((item) => ({
  화면명: item.screenName,
  순번: item.index,
  코드: item.code,
  "코드에 대한 값": item.koValue,
}));
const koSheet = XLSX.utils.json_to_sheet(koData);
XLSX.utils.book_append_sheet(workbook, koSheet, "한글");

// 영어 시트
const enData = allData.map((item) => ({
  화면명: item.screenName,
  순번: item.index,
  코드: item.code,
  "코드에 대한 값": item.enValue,
}));
const enSheet = XLSX.utils.json_to_sheet(enData);
XLSX.utils.book_append_sheet(workbook, enSheet, "영어");

// 파일 저장
const outputPath = path.join(
  __dirname,
  "../public/i18n-validation-messages.xlsx"
);
XLSX.writeFile(workbook, outputPath);

console.log(`다국어 정리 파일이 생성되었습니다: ${outputPath}`);
console.log(
  `총 ${allData.length}개의 다국어 코드를 찾았습니다. (validation, messages만)`
);
console.log(`접근 URL: http://localhost:5173/i18n-validation-messages.xlsx`);
