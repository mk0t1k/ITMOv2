export default async function (ctx) {
  ctx.tool.hook("execute.after", async (input, output) => {
    const editTools = ["write_to_file", "replace_file_content", "edit_file"];
    if (editTools.includes(input.tool)) {
      const res = await ctx.exec("sh scripts/check.sh");
      return {
        ...output,
        checkResult: res.stdout || res.stderr,
      };
    }
    return output;
  });
}