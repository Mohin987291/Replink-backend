import { AppStatus } from "../generated/prisma/index.js";

export interface Application {
    gigId: string;
    repId: string;
    status?: AppStatus;
}