#!/usr/bin/env node
import mri from "mri";
import * as prompts from "@clack/prompts";
import colors from "picocolors";
import { v4 as uuid } from "uuid";

import fs from "node:fs";
import path from "node:path";

import {
  isValidPackageName,
  pkgFromUserAgent,
  toValidPackageName,
} from "./pkg";
import { copy, emptyDir, isEmpty } from "./fs-utils";
import { fileURLToPath } from "node:url";

const { blue, red } = colors;

const argv = mri<{
  template?: string;
  help?: boolean;
  overwrite?: boolean;
}>(process.argv.slice(2), {
  alias: { h: "help", t: "template" },
  boolean: ["help", "overwrite"],
  string: ["template"],
});

const cwd = process.cwd();

const TEMPLATE_NAME = {
  REACT_TS_TW: "react-ts-tw",
} as const;

type TemplateNameKey = keyof typeof TEMPLATE_NAME;
type TemplateName = (typeof TEMPLATE_NAME)[keyof typeof TEMPLATE_NAME];

const templateNames: string[] = Object.values(TEMPLATE_NAME);

const TEMPLATE_DISPLAY_NAME = {
  REACT_TS_TW: "React + TypeScript + TailwindCSS",
} as const satisfies Record<TemplateNameKey, string>;

const MAIN_FILE_NAME = {
  [TEMPLATE_NAME.REACT_TS_TW]: "src/main.tsx",
} as const satisfies Record<TemplateName, string>;

const helpMessage = `\
Usage: create-react-webcomponent [OPTION]... [DIRECTORY]

Create a new React - Webcomponent project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${blue(TEMPLATE_NAME.REACT_TS_TW)}`;

type ColorFunc = (str: string | number) => string;
type Template = {
  name: string;
  display: string;
  color: ColorFunc;
};

const TEMPLATES: Template[] = [
  {
    name: TEMPLATE_NAME.REACT_TS_TW,
    display: TEMPLATE_DISPLAY_NAME.REACT_TS_TW,
    color: blue,
  },
];

const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};

const defaultTargetDir = "react-webcomponent";

async function init() {
  const argTargetDir = argv._[0]
    ? formatTargetDir(String(argv._[0]))
    : undefined;

  const argTemplate = argv.template;
  const argOverwrite = argv.overwrite;
  const argHelp = argv.help;

  if (argHelp) {
    console.log(helpMessage);
    return;
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const cancel = () => prompts.cancel("Operation cancelled");

  // 1. Get project name and target dir
  let targetDir = argTargetDir;
  if (!targetDir) {
    const projectName = await prompts.text({
      message: "Project name:",
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir,
    });
    if (prompts.isCancel(projectName)) {
      return cancel();
    }
    targetDir = formatTargetDir(projectName as string);
  }

  // 2. Handle directory if exist and not empty
  if (fs.existsSync(targetDir) && !isEmpty(targetDir)) {
    const overwrite = argOverwrite
      ? "yes"
      : await prompts.select({
          message:
            (targetDir === "."
              ? "Current directory"
              : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          options: [
            {
              label: "Cancel operation",
              value: "no",
            },
            {
              label: "Remove existing files and continue",
              value: "yes",
            },
            {
              label: "Ignore files and continue",
              value: "ignore",
            },
          ],
        });
    if (prompts.isCancel(overwrite)) return cancel();
    switch (overwrite) {
      case "yes":
        emptyDir(targetDir);
        break;
      case "no":
        cancel();
        return;
    }
  }

  // 3. Get package name
  let packageName = path.basename(path.resolve(targetDir));
  if (!isValidPackageName(packageName)) {
    const packageNameResult = await prompts.text({
      message: "Package name:",
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir) {
        if (!isValidPackageName(dir)) {
          return "Invalid package.json name";
        }
      },
    });
    if (prompts.isCancel(packageNameResult)) return cancel();
    packageName = packageNameResult;
  }

  // 4. Choose a template
  let template = argTemplate;
  let hasInvalidArgTemplate = false;
  if (argTemplate && !templateNames.includes(argTemplate)) {
    template = undefined;
    hasInvalidArgTemplate = true;
  }

  if (!template) {
    const selectedTemplate = await prompts.select({
      message: hasInvalidArgTemplate
        ? `"${argTemplate}" isn't a valid template. Please choose from below: `
        : "Select a template:",
      options: TEMPLATES.map((template) => {
        const templateColor = template.color;
        return {
          label: templateColor(template.display || template.name),
          value: template,
        };
      }),
    });
    template = (selectedTemplate as Template).name;
    if (prompts.isCancel(template)) return cancel();
  }

  const DO_NOT_JUST_COPY_FILES = [
    "package.json",
    "index.html",
    "src/App.css",
    MAIN_FILE_NAME[template as TemplateName],
    "vite.config.ts",
  ];

  const root = path.join(cwd, targetDir);
  fs.mkdirSync(root, { recursive: true });

  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  prompts.log.step(`Scaffolding project in ${root}...`);

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    `template-${template}`
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => !DO_NOT_JUST_COPY_FILES.includes(f))) {
    write(file);
  }

  const packageJSON = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  packageJSON.name = packageName;
  write("package.json", JSON.stringify(packageJSON, null, 2) + "\n");

  const otherDoNotJustCopyFiles = DO_NOT_JUST_COPY_FILES.filter(
    (fName) => fName !== "package.json"
  );

  const id = uuid().slice(0, 4);

  otherDoNotJustCopyFiles.forEach((fName) => {
    let fileText = fs.readFileSync(path.join(templateDir, fName), "utf-8");
    fileText = fileText.replace(/{{package_name}}/g, packageName);
    fileText = fileText.replace(/{{id}}/g, id);
    write(fName, fileText);
  });

  let doneMessage = "";
  const cdProjectName = path.relative(cwd, root);
  doneMessage += `Done. Now run:\n`;
  if (root !== cwd) {
    doneMessage += `\n  cd ${
      cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
    }`;
  }
  switch (pkgManager) {
    case "yarn":
      doneMessage += "\n  yarn";
      doneMessage += "\n  yarn dev";
      break;
    default:
      doneMessage += `\n  ${pkgManager} install`;
      doneMessage += `\n  ${pkgManager} run dev`;
      break;
  }
  prompts.outro(doneMessage);
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, "");
}

init().catch((error) => {
  console.error(red(error.message));
});
