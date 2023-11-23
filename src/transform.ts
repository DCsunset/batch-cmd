export async function* splitTransformer(iterable: AsyncIterable<string>, separator: string | RegExp) {
  let inBuffer = "";
  for await (const data of iterable) {
    inBuffer += data
    const splits = inBuffer.split(separator);
    if (splits.length > 0) {
      inBuffer = splits.pop()!;
      for (const s of splits) {
        yield s;
      }
    }
  }
  if (inBuffer.length > 0) {
    yield inBuffer;
  }
}
