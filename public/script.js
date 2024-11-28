document.getElementById('startStream').addEventListener('click', () => {
    const hwm = document.getElementById('hwm').value;
    const cs = document.getElementById('cs').value;
    const cq = document.getElementById('cq').value;

    fetch(`/start-stream?hwm=${hwm}&cs=${cs}&cq=${cq}`)
        .then(response => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let counter = 0;
            let chunksCount = 0;
            let chunksSent = 0;
            let stopSignalsCount = 0;

            function read() {
                return reader.read().then(({ done, value }) => {
                    if (done) {
                        console.log("Stream finished.");
                        return;
                    }
                    const responseCode = decoder.decode(value);
                    if (responseCode.includes('rsd')) {
                        const packagesNumber = (responseCode.match(/rsd/g) || []);
                        document.querySelector('.packages__delivered').innerHTML = '';                        

                        for(let i in packagesNumber) {
                            const img = document.createElement("img");
                            img.setAttribute('src', 'https://cdn.icon-icons.com/icons2/1465/PNG/512/724package_100522.png');
                            img.setAttribute('height', 100);
                            chunksSent++;
                            document.querySelector('.chunks__sent').innerHTML = `Consumed chunks: ${chunksSent}`

                            document.querySelector('.packages__delivered').appendChild(img);
                        }
                        const img = document.createElement("img");
                        img.setAttribute('src', 'https://www.shutterstock.com/image-vector/stop-sign-icon-hand-vector-260nw-1549832570.jpg');
                        img.setAttribute('height', 100);
                        document.querySelector('.packages__delivered').appendChild(img);
                        stopSignalsCount++;
                        document.querySelector('.stop__signals').innerHTML = `stop signals: ${stopSignalsCount}`
                    }
                    if (responseCode.includes('cr')) {
                        chunksCount++;
                        const img = document.createElement("img");
                        img.setAttribute('src', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyV31uvIwvFvh-lRd-wYGFypMWCVXvRUbtfg&s');
                        img.setAttribute('height', 100);    
                        document.querySelector('.packages__processed').appendChild(img);
                        document.querySelector('.chunks__count').innerHTML = `Chunks count: ${chunksCount}`
                    }
                    
                    if (responseCode.includes('bc')) {
                        document.querySelector('.packages__processed').innerHTML = '';
                    }
                    if (responseCode.includes('fp')) {
                        const doneText = document.createElement("h1");
                        doneText.innerText = "Done."
                        document.querySelector('.packages__display').innerHTML = '';
                        document.querySelector('.packages__display').appendChild(doneText);
                    }
                    
                    return read();
                });
            }

            return read();
        })
        .catch(error => {
            console.error("Error in stream:", error);
        });
});