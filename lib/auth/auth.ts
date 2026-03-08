import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db()

export const auth=betterAuth({
    database:mongodbAdapter(
        db,{
            client,
        }
    ),
    emailAndPassword:{
        enabled:true,
    }
});