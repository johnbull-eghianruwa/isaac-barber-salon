import { PrismaClient } from "@prisma/client";
import { env } from "../../env/server.mjs";
export const prisma = global.prisma ||
    new PrismaClient({
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
if (env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
//# sourceMappingURL=clients.js.map