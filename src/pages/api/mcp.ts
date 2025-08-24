import type { APIRoute } from "astro";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const POST: APIRoute = async ({ request }) => {
    try {
        const message = await request.json();

        // Iniciar el servidor MCP
        const serverPath = path.join(__dirname, "..", "..", "mcp", "server.js");
        const serverProcess = spawn("node", [serverPath], {
            stdio: ["pipe", "pipe", "pipe"]
        });

        return new Promise((resolve, reject) => {
            let output = "";
            let errorOutput = "";

            serverProcess.stdout.on("data", (data) => {
                output += data.toString();
            });

            serverProcess.stderr.on("data", (data) => {
                errorOutput += data.toString();
            });

            serverProcess.on("close", (code) => {
                if (code === 0) {
                    try {
                        const response = JSON.parse(output.trim());
                        resolve(new Response(JSON.stringify(response), {
                            status: 200,
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }));
                    } catch (e) {
                        reject(new Response(JSON.stringify({
                            error: "Error parsing MCP response",
                            details: e instanceof Error ? e.message : "Unknown error"
                        }), {
                            status: 500,
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }));
                    }
                } else {
                    reject(new Response(JSON.stringify({
                        error: "MCP server error",
                        code,
                        stderr: errorOutput
                    }), {
                        status: 500,
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }));
                }
            });

            // Enviar el mensaje al servidor MCP
            serverProcess.stdin.write(JSON.stringify(message) + "\n");
            serverProcess.stdin.end();

            // Timeout de seguridad
            setTimeout(() => {
                serverProcess.kill();
                reject(new Response(JSON.stringify({
                    error: "Timeout"
                }), {
                    status: 408,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }));
            }, 10000);
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Invalid request",
            details: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
};
