import * as child_process from "child_process";
import * as fs from "fs";
import {
    join as pathJoin
} from "path";
import { assert } from "tsafe/assert";

const startTime = Date.now();

const distDirPath = pathJoin(__dirname, "..", "dist");

if (fs.existsSync(distDirPath)) {
    fs.rmSync(distDirPath, { "recursive": true });
}

run("npx tsc");

{
    const version: string = JSON.parse(
        fs.readFileSync(pathJoin(process.cwd(), "package.json")).toString("utf8")
    ).version;

    assert(typeof version === "string");

    const filePath = pathJoin(distDirPath, "main.js");

    const content = fs.readFileSync(filePath).toString("utf8");

    const content_modified = content.replace("{{VERSION}}", version);

    assert(content !== content_modified);

    fs.writeFileSync(filePath, content_modified);
}

// NOTE: Will creates the dist/index.js file that is our bundled program.
run("npx ncc build dist/main.js");


console.log(`✓ built in ${((Date.now() - startTime) / 1000).toFixed(2)}s`);

function run(command: string) {
    console.log(`$ ${command}`);
    child_process.execSync(command, { "stdio": "inherit" });
}
