const { createWorker } = require('tesseract.js');
const fs = require('fs');

let workerPromise;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker(process.env.OCR_LANGUAGE || 'eng');
      return worker;
    })();
  }
  return workerPromise;
}

async function readPlateFromImage(filePath) {
  const worker = await getWorker();
  const result = await worker.recognize(fs.readFileSync(filePath));
  const text = result?.data?.text || '';
  const confidence = Number(result?.data?.confidence || 0);

  const candidates = text
    .toUpperCase()
    .split(/\s+/)
    .map(x => x.replace(/[^A-Z0-9]/g, ''))
    .filter(x => x.length >= 6 && x.length <= 12);

  return { text: text.trim(), candidate: candidates[0] || '', confidence };
}

module.exports = { readPlateFromImage };
