"use strict";
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = 3000;

// Kérések törzsének (body) beolvasásához szükséges middleware
app.use(express.json());

// CORS engedélyezése a frontend felé
app.use(cors());

// Naplózó middleware (Morgan) dev módban
app.use(morgan("dev"));

// Mock Swagger dokumentáció objektum a /docs végponthoz
const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "Jedlik REST API Server - Motoros Garázs",
        version: "1.0.0",
        description: "Frontend vizsga mintafeladat háttérszolgáltatása"
    },
    servers: [{ url: "http://localhost:3000" }],
    paths: {
        "/api/vehicles": {
            get: {
                tags: ["Vehicles"],
                summary: "Összes jármű adatának lekérdezése",
                responses: { "200": { description: "Sikeres lekérdezés" } }
            }
        },
        "/api/vehicles/{id}/logs": {
            get: {
                tags: ["Service Logs"],
                summary: "Adott járműhöz tartozó szerviznaplók lekérése",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
                responses: { "200": { description: "Sikeres lekérdezés" } }
            }
        },
        "/api/logs": {
            post: {
                tags: ["Service Logs"],
                summary: "Új szervizbejegyzés rögzítése",
                requestBody: {
                    required: true,
                    content: { "application/json": { schema: { type: "object" } } }
                },
                responses: { 
                    "210": { description: "Sikeres mentés" },
                    "400": { description: "Validációs vagy szerver hiba" }
                }
            }
        }
    }
};

const options = { swaggerOptions: { tryItOutEnabled: true } };
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

// --- API VÉGPONTOK ---

// 1. Összes jármű lekérése
app.get("/api/vehicles", async (req, res) => {
    // #swagger.tags = ['Vehicles']
    // #swagger.summary = 'Read all data from vehicles table'
    try {
        const data = await readDataFromFile("vehicles");
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ message: "Szerver hiba az adatok beolvasásakor." });
    }
});

// 2. Szerviznaplók lekérése egy adott jármű ID alapján (Szűrt lekérdezés)
app.get("/api/vehicles/:id/logs", async (req, res) => {
    // #swagger.tags = ['Service Logs']
    // #swagger.summary = 'Read filtered service logs for a specific vehicle'
    try {
        const vehicleId = parseInt(req.params.id);
        const allLogs = await readDataFromFile("service_logs");
        
        // Csak azokat a bejegyzéseket adjuk vissza, amik a kért járműhöz tartoznak
        const filteredLogs = allLogs.filter(log => log.vehicleId === vehicleId);
        
        res.status(200).send(filteredLogs);
    } catch (error) {
        res.status(500).send({ message: "Szerver hiba a naplók szűrése során." });
    }
});

// 3. Új szerviznapló bejegyzés rögzítése POST metódussal
app.post("/api/logs", async (req, res) => {
    // #swagger.tags = ['Service Logs']
    // #swagger.summary = 'Create a new service log entry'
    try {
        const newLog = req.body;
        const data = await readDataFromFile("service_logs");

        // UI validációk ellenőrzése a szerver oldalon is (biztonság / tesztelés miatt)
        if (!newLog.vehicleId) 
            throw new Error("A jármű azonosító megadása kötelező.");
        if (!newLog.date || newLog.date.trim() === "") 
            throw new Error("A dátum mező kitöltése kötelező.");
        if (!newLog.component || newLog.component.trim() === "") 
            throw new Error("Az alkatrész megnevezése kötelező.");
        if (!newLog.description || newLog.description.trim() === "") 
            throw new Error("A leírás mező nem maradhat üresen.");

        // Automatikus ID generálás (legnagyobb ID + 1)
        const nextId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
        
        const logToSave = {
            id: nextId,
            vehicleId: parseInt(newLog.vehicleId),
            date: newLog.date,
            component: newLog.component,
            description: newLog.description
        };

        data.push(logToSave);
        const response = await saveDataToFile("service_logs", data);

        if (response === "OK") {
            // A beküldött és elmentett objektum ID-jával tér vissza sikeres kóddal
            res.status(201).send({ id: logToSave.id });
        } else {
            res.status(400).send({ message: response });
        }
    } catch (error) {
        // Ha hiba van, a megadott leírás szerint a frontendnek átadható szöveggel tér vissza
        res.status(400).send({ message: error.message });
    }
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Jedlik Json-Backend-Server Swagger: http://localhost:${PORT}/docs`);
});

// Fájlkezelő segédfüggvények (beolvasás és mentés)
async function readDataFromFile(table) {
    try {
        const data = await fs.readFile(`db_${table}.json`, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveDataToFile(table, data) {
    try {
        await fs.writeFile(`db_${table}.json`, JSON.stringify(data, null, 2), "utf8");
        return "OK";
    } catch (error) {
        return error.message;
    }
}