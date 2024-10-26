const appName = "lap-counter";
const buildDir = "build";

const targets = [
  "x86_64-apple-darwin",
  "aarch64-apple-darwin",
  "x86_64-unknown-linux-gnu",
  "aarch64-unknown-linux-gnu"
];

const permissions = [
  "--allow-read",
  "--allow-write",
  "--allow-net",
  "--allow-env",
  "--allow-run"
];

async function ensureBuildDir() {
  try {
    await Deno.mkdir(`${Deno.cwd()}/${buildDir}`);
  } catch (error) {
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      throw error;
    }
  }
}

async function compile() {
  await ensureBuildDir();

  for (const target of targets) {
    console.log(`\nCompiling for ${target}...`);

    const outputSuffix = target.includes("darwin") ? "macos" : "linux";
    const arch = target.includes("x86_64") ? "x64" : "arm64";
    const outputName = `build/${appName}-${outputSuffix}-${arch}`;

    const cmd = new Deno.Command("deno", {
      args: [
        "compile",
        ...permissions,
        "--target", target,
        "--output", outputName,
        "--allow-import",
        "src/main.ts"
      ]
    });

    const { code, stdout, stderr } = await cmd.output();

    if (code === 0) {
      console.log(`✓ Successfully compiled for ${target}`);
      console.log(`  Output: ${outputName}`);
    } else {
      console.error(`✗ Failed to compile for ${target}`);
      console.error(new TextDecoder().decode(stderr));
    }
  }
}

if (import.meta.main) {
  compile();
}
