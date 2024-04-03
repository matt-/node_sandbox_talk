const binding = process.binding('fs');
const constants = process.binding('constants').fs;

const filePath = "/etc/passwd";

const fd = binding.open(filePath, constants.O_RDONLY, 438, undefined, {path: filePath});
stats = binding.fstat(fd, false, undefined, {});
const size = stats[8];
const buffer = Buffer.allocUnsafe(size); 

const length = size;

const ctx = {}, offset = 0, position = -1;
const result = binding.read(fd, buffer, offset, length, position,
                            undefined, ctx);

console.log(buffer.toString());