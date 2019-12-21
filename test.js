const fs = require('fs');
const wStream = fs.createWriteStream('myOutput.txt');

function writeToStream(i) {
    for (; i < 100000; i++) {
        if (!wStream.write(i + '\n')) {
            // Defining a listener to wStream, to when the write queue is available or memeory is available - resume the operation of writing to memory
            wStream.once('drain', function () {
                writeToStream(i + 1);
            });
            return;
        }
    }
    console.log("END! ");
    wStream.end();
}

writeToStream(0);