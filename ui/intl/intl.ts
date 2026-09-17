import { readFile } from "fs/promises";
import path from "path";
import { MessageFormatElement } from "react-intl";

const MESSAGES_DIR = path.join(process.cwd(), "intl/messages");

export type IntlLang = "en-US";

export type IntlData = {
  lang: IntlLang;
  messages: Record<string, string> | Record<string, MessageFormatElement[]>;
};

export async function getIntl(lang: IntlLang): Promise<IntlData> {
  const jsonPath = path.join(MESSAGES_DIR, `${lang}.json`);
  console.log(jsonPath);
  const json = await readFile(jsonPath, "utf-8");
  const messages = JSON.parse(json);
  return {
    lang,
    messages,
  };
}
