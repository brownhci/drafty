import { exec } from 'child_process'; 

export function execShellCommand(cmd: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            } else if (stdout) {
                console.log(stdout); 
            } else {
                console.log(stderr);
            }
            resolve(stdout ? true : false);
        });
    });
}
