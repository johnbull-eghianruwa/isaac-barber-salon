"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trpc = void 0;
const client_1 = require("@trpc/client");
const next_1 = require("@trpc/next");
const superjson_1 = __importDefault(require("superjson"));
const getBaseUrl = () => {
    if (typeof window !== "undefined")
        return ""; // browser should use relative url
    if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};
exports.trpc = (0, next_1.createTRPCNext)({
    config() {
        return {
            transformer: superjson_1.default,
            links: [
                (0, client_1.loggerLink)({
                    enabled: (opts) => process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" && opts.result instanceof Error),
                }),
                (0, client_1.httpBatchLink)({
                    url: `${getBaseUrl()}/api/trpc`,
                }),
            ],
        };
    },
    ssr: false,
});
//# sourceMappingURL=Trpc.js.map