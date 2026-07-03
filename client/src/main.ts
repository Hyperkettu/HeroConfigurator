import { Application } from "./application";

let app: Application  | null = null;

export async function main() {
    app = new Application();
    app.init();
}