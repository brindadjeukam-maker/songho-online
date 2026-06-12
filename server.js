/**
 * JEU DU SONGHO - VERSION 2 MULTIJOUEUR EN LIGNE
 * Serveur Express - API REST pour la synchronisation des salles
 * Auteur : DJEUKAM CHIENGUE BRINDA LESLIE | 23V2815
 * UE INF 222 - Programmation Web
 */

const express = require('express');
const path    = require('path');

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Stockage des salles en mémoire du serveur ──────────────────────────────
// Structure : rooms[code] = { state }
const rooms = {};

// ── Nettoyage automatique des vieilles salles (toutes les 30 min) ──────────
setInterval(() => {
    const now = Date.now();
    for (const code in rooms) {
        if (now - rooms[code].updatedAt > 2 * 60 * 60 * 1000) { // 2 heures
            delete rooms[code];
        }
    }
}, 30 * 60 * 1000);

// ── API : lire l'état d'une salle ──────────────────────────────────────────
app.get('/api/room/:code', (req, res) => {
    const code = req.params.code.toUpperCase();
    const room = rooms[code];
    if (!room) return res.status(404).json({ error: 'Salle introuvable' });
    res.json(room.state);
});

// ── API : créer ou mettre à jour une salle ─────────────────────────────────
app.post('/api/room/:code', (req, res) => {
    const code  = req.params.code.toUpperCase();
    const state = req.body;
    if (!state || typeof state !== 'object') {
        return res.status(400).json({ error: 'État invalide' });
    }
    rooms[code] = { state, updatedAt: Date.now() };
    res.json({ ok: true });
});

// ── Toutes les autres routes renvoient index.html (SPA) ───────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Démarrage ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur SONGHO démarré sur le port ${PORT}`);
});
