const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * Fake in-memory DB
 */
let templates = [
  {
    id: 1,
    name: "Contract A",
    content: "Content A",
    clientName: "Client A",
    contractDate: "2025-12-01",
    contractType: "NDA",
    attachments: null,
    tags: ["Urgent", "Optional"], 
    isActive: true,            
  },
  {
    id: 2,
    name: "Contract B",
    content: "Content B",
    clientName: "Client B",
    contractDate: "2025-12-05",
    contractType: "Service",
    attachments: null,
    tags: ["Important"],
    isActive: false,
  },
];

/**
 * LIST templates
 */
app.get('/templates', (req, res) => {
  res.json(templates);
});

/**
 * CREATE template
 */
app.post('/templates', (req, res) => {
  const newTemplate = {
    id: Date.now(),
    name: req.body.name,
    content: req.body.content || "",
    clientName: req.body.clientName || "",
    contractDate: req.body.contractDate || "",
    contractType: req.body.contractType || "",
    attachments: req.body.attachments || null,
    tags: req.body.tags || [],      // added
    isActive: req.body.isActive || false, // added
    fields: req.body.fields || {}
  };
  templates.push(newTemplate);
  res.json(newTemplate);
});

/**
 * UPDATE template
 */
app.put('/templates/:id', (req, res) => {
  const id = Number(req.params.id);
  templates = templates.map(t =>
    t.id === id
      ? {
          ...t,
          ...req.body,
          tags: req.body.tags || t.tags,       // ensure tags updated
          isActive: req.body.isActive ?? t.isActive // ensure status updated
        }
      : t
  );
  res.json({ success: true });
});

/**
 * DELETE template
 */
app.delete('/templates/:id', (req, res) => {
  const id = Number(req.params.id);
  templates = templates.filter(t => t.id !== id);
  res.json({ success: true });
});

/**
 * GET template by ID
 */
app.get('/templates/:id', (req, res) => {
  const id = Number(req.params.id);
  const template = templates.find(t => t.id === id);
  if (template) {
    res.json(template);
  } else {
    res.status(404).json({ error: 'Template not found' });
  }
});

/**
 * File upload simulation
 */
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), (req, res) => {
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl
  });
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log("Mock API running on http://localhost:3000");
});
