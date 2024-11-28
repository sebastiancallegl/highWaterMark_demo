const express = require('express');
const { Readable, Writable } = require('stream');
const { pipeline } = require('node:stream/promises')

const app = express();
app.listen(3000, () => {
    console.log('listening on port 3000');
})
app.use(express.static('public'));

class MyReadableStream extends Readable {
    constructor(options) {
        super(options);
        console.log(options)
        this.chunkSize = options.chunkSize;
        this.chunkQuantity = options.chunkQuantity;
        this.counter = 0;
    }

    _read(size) {
        if (this.counter < this.chunkQuantity) {
            this.counter++;
            const data = `Data chunk #${this.counter}\n`;
            console.log(`Pushing: ${data.trim()}`);
            const chunk = "1".repeat(this.chunkSize);
            this.push(chunk);
        } else {
            this.push(null);
        }
    }
}

class MyWritableStream extends Writable {
    constructor(options) {
        super(options);
        this.processing = false;
        this.res = options.res
    }

    _write(chunk, encoding, callback) {
        this.processing = true;
        console.log(`Received: ${chunk.toString().trim()}`);
        this.res.write('cr');
        setTimeout(() => {
            this.processing = false;
            console.log(`Processed: ${chunk.toString().trim()}`);
            callback();
        }, 500);
    }
}

app.get('/start-stream', async(req, res) => {
    const highWaterMark = parseInt(req.query.hwm) || 2;
    const chunkSize = parseInt(req.query.cs) || 1;
    const chunkQuantity = parseInt(req.query.cq) || 10;

    const writableStream = new MyWritableStream({ highWaterMark, res });
    const readableStream = new MyReadableStream({ chunkQuantity, chunkSize });

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    pipeline(
        readableStream,
        writableStream
    );

    readableStream.on('data', (chunk) => {
        console.log('adding data')
        res.write('rsd')
    })

    writableStream.on('drain', (evt) => {
        console.log('Writable stream is ready to accept more data.');
        res.write('bc');
    });

    writableStream.on('finish', () => {
        console.log('All data processed.');
        res.end('fp');
    });
});