const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const DATABASE_URL = 'mongodb://localhost:27017/gyak';

mongoose.connect(DATABASE_URL)
  .then(async () => {
    console.log(`Sikeresen csatlakozva az adatbázishoz: ${mongoose.connection.name}`);
    
    const koncertDarab = await mongoose.connection.db.collection('koncertek').countDocuments();
    console.log(`DOKUMENTUMOK SZÁMA A 'koncertek' KOLLEKCIÓBAN: ${koncertDarab}`);
  })
  .catch(err => console.error('Adatbázis csatlakozási hiba:', err));

const egyuttesSchema = new mongoose.Schema({
  _id: { type: Number, required: true }, // Prisma @id @map("_id") Int megfelelője
  nev: { type: String, required: true, unique: true },
  alapitva: { type: Number, default: null }
}, { collection: 'egyuttesek', versionKey: false });

const Egyuttes = mongoose.model('Egyuttes', egyuttesSchema);

const koncertSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  datum: { type: String, required: true },
  egyuttesId: { type: Number, required: true },
  kapacitas: { type: Number, required: true },
  varos: { type: String, required: true }
}, { collection: 'koncertek', versionKey: false });

const Koncert = mongoose.model('Koncert', koncertSchema);

const rendelesSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  db: { type: Number, required: true },
  email: { type: String, required: true },
  koncertId: { type: Number, required: true }
}, { collection: 'rendelesek', versionKey: false });

const Rendeles = mongoose.model('Rendeles', rendelesSchema);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/api/koncertek', async (req, res) => {
  try {
    const koncertek = await Koncert.find({}).lean();
    const egyuttesek = await Egyuttes.find({}).lean();

    const egyuttesMap = {};
    egyuttesek.forEach(e => {
      egyuttesMap[e._id] = e.nev;
    });

    const formrazottKoncertek = koncertek.map(k => ({
      datum: k.datum,
      kapacitas: k.kapacitas,
      egyuttes: {
        nev: egyuttesMap[k.egyuttesId] || ""
      }
    }));

    res.status(200).json(formrazottKoncertek);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/rendelesek/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const rendelesek = await Rendeles.find({ email: email }).lean();
    const koncertek = await Koncert.find({}).lean();
    const egyuttesek = await Egyuttes.find({}).lean();

    const koncertMap = {};
    koncertek.forEach(k => {
      const egyuttes = egyuttesek.find(e => e._id === k.egyuttesId);
      koncertMap[k._id] = {
        datum: k.datum,
        egyuttes: {
          nev: egyuttes ? egyuttes.nev : "",
          alapitva: egyuttes ? egyuttes.alapitva : null
        }
      };
    });

    const formataltrandelesek = rendelesek.map(r => ({
      db: r.db,
      koncert: koncertMap[r.koncertId] || null
    }));

    res.status(200).json(formataltrandelesek);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/rendeles', async (req, res) => {
  try {
    const body = req.body; 
    console.log(body.koncertId);
    
    const koncert = await Koncert.findOne({ _id: body.koncertId });
    if (!koncert) {
      return res.status(400).json({
        message: `A koncert ${body.koncertId} id-vel nem létezik!`
      });
    }

    const korabbiRendelesek = await Rendeles.find({ koncertId: body.koncertId });
    let eladva = 0;
    for (const r of korabbiRendelesek) {
      eladva += r.db;
    }

    const maradekJegyek = koncert.kapacitas - eladva;

    if (maradekJegyek < body.db) {
      return res.status(401).json({
        message: `Nincs ennyi jegy a koncertre, már csak  ${maradekJegyek} db jegy vásárolható!`
      });
    }

    const ujRendeles = new Rendeles({
      _id: body.id,
      db: body.db,
      email: body.email,
      koncertId: body.koncertId
    });

    await ujRendeles.save();

    return res.status(200).json({
      message: "Köszönjük a vásárlást!"
    });
  } catch (error) {

    return res.status(200).json({ message: error.message });
  }
});

app.get('/:slug', (req, res) => {
  res.send(`Hello ${req.params.slug}`);
});

app.listen(PORT, () => {
  console.log(`Express API szerver fut a http://localhost:${PORT} címen.`);
});