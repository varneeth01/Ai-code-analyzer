import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function recognizeHandwriting(imageBase64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'python', 'handwriting_recognition.py');
    const pythonProcess = spawn('python3', [pythonScript]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}: ${error}`));
      } else {
        resolve(result.trim());
      }
    });

    // Send the base64 image to the Python script
    pythonProcess.stdin.write(imageBase64);
    pythonProcess.stdin.end();
  });
}
