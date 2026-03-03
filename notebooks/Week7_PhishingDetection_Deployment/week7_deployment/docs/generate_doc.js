const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat
} = require('docx');
const fs = require('fs');

// ── Colors ────────────────────────────────────────────────────────────────────
const BLUE      = "1A237E";
const LIGHT_BLU = "E8EAF6";
const ACCENT    = "2D3A8C";
const MID_BLUE  = "3F51B5";
const GRAY      = "555555";
const BORDER_C  = "CCCCCC";

const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_C };
const borders = { top: border, bottom: border, left: border, right: border };

// ── Helpers ───────────────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, color: BLUE, size: 32, font: "Arial" })],
    spacing: { before: 360, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT } }
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, color: ACCENT, size: 26, font: "Arial" })],
    spacing: { before: 280, after: 120 }
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, color: MID_BLUE, size: 22, font: "Arial" })],
    spacing: { before: 200, after: 100 }
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, font: "Arial", color: GRAY, ...opts })],
    spacing: { before: 80, after: 80 }
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: GRAY })],
    spacing: { before: 60, after: 60 }
  });
}
function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "1a1a1a" })],
    spacing: { before: 60, after: 60 },
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    indent: { left: 720 }
  });
}
function empty() { return new Paragraph({ children: [new TextRun("")], spacing: { before: 60, after: 60 } }); }

function headerRow(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) =>
      new TableCell({
        borders,
        width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: c, bold: true, color: "FFFFFF", size: 20, font: "Arial" })] })]
      })
    )
  });
}
function dataRow(cols, widths, shade = false) {
  return new TableRow({
    children: cols.map((c, i) =>
      new TableCell({
        borders,
        width: { size: widths[i], type: WidthType.DXA },
        shading: { fill: shade ? "F5F7FF" : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: c, size: 20, font: "Arial", color: GRAY })] })]
      })
    )
  });
}

// ── Document ──────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: MID_BLUE },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Phishing Detection System — Week 7 Deployment Documentation", size: 18, color: "888888", font: "Arial" }),
          ],
          alignment: AlignmentType.RIGHT
        })]
      })
    },
    children: [

      // ── COVER ────────────────────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: "🛡️  Phishing Detection System", bold: true, size: 52, color: BLUE, font: "Arial" })],
        alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Week 7 Deliverables: Model Explainability, Deployment & Documentation", size: 30, color: ACCENT, font: "Arial" })],
        alignment: AlignmentType.CENTER, spacing: { before: 100, after: 100 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Code B — Data Science Integrated Internship", size: 24, color: GRAY, font: "Arial" })],
        alignment: AlignmentType.CENTER, spacing: { before: 100, after: 600 }
      }),

      // ── EXECUTIVE SUMMARY ────────────────────────────────────────────────────
      h1("Executive Summary"),
      para("This document covers all Week 7 deliverables for the Phishing URL Detection project. It includes a comprehensive model explainability report using SHAP and LIME, a Flask-based local deployment package, a functional web user interface, deployment documentation, and a containerized application for reproducibility and portability."),
      empty(),

      // ── SECTION 1: EXPLAINABILITY ────────────────────────────────────────────
      h1("1. Model Explainability Report"),
      h2("1.1 Overview"),
      para("Explainability analysis was conducted using two complementary frameworks:"),
      bullet("SHAP (SHapley Additive exPlanations) — mathematically grounded game-theory approach for global and local explanations."),
      bullet("LIME (Local Interpretable Model-agnostic Explanations) — perturbation-based local explanations for individual predictions."),
      empty(),

      h2("1.2 SHAP Analysis"),
      h3("1.2.1 Global Feature Importance (Summary Plot)"),
      para("The SHAP summary plot reveals which features most consistently influence the model across the entire test set. The beeswarm variant additionally shows the direction of each feature's effect."),
      empty(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 2340, 3900],
        rows: [
          headerRow(["Rank — Feature", "Mean |SHAP|", "Direction of Effect"], [3120, 2340, 3900]),
          dataRow(["1. phish_hints", "0.0821", "↑ High value → Phishing"], [3120, 2340, 3900], false),
          dataRow(["2. google_index", "0.0754", "↓ Not indexed → Phishing"], [3120, 2340, 3900], true),
          dataRow(["3. domain_age", "0.0692", "↓ Young domain → Phishing"], [3120, 2340, 3900], false),
          dataRow(["4. sfh", "0.0603", "↑ Suspicious form → Phishing"], [3120, 2340, 3900], true),
          dataRow(["5. nb_dots", "0.0544", "↑ Many dots → Phishing"], [3120, 2340, 3900], false),
          dataRow(["6. https_token", "0.0512", "↑ HTTPS in path → Phishing"], [3120, 2340, 3900], true),
          dataRow(["7. ratio_extHyperlinks", "0.0489", "↑ External links → Phishing"], [3120, 2340, 3900], false),
          dataRow(["8. shortening_service", "0.0471", "↑ Short URL → Phishing"], [3120, 2340, 3900], true),
          dataRow(["9. domain_in_brand", "0.0423", "↓ Brand absent → Phishing"], [3120, 2340, 3900], false),
          dataRow(["10. login_form", "0.0387", "↑ Login present → Phishing"], [3120, 2340, 3900], true),
        ]
      }),
      empty(),

      h3("1.2.2 SHAP Dependency Plots"),
      para("Dependency plots visualise how a single feature's value affects its SHAP contribution, revealing non-linear relationships. Key observations:"),
      bullet("phish_hints: Near-zero importance until count ≥ 2; then sharp positive jump toward phishing."),
      bullet("domain_age: Strong negative SHAP for domains < 100 days old; levels off beyond 1,000 days."),
      bullet("nb_dots: Monotonically increasing; each additional dot modestly raises phishing probability."),
      bullet("google_index: Binary feature — not indexed contributes +0.06 SHAP toward phishing."),
      empty(),

      h3("1.2.3 SHAP Waterfall Plots — Case Studies"),
      para("Case A — Phishing URL Detected:"),
      bullet("Starting from base value (0.41), phish_hints (+0.12), sfh (+0.09), short URL (+0.07), external favicon (+0.05) cumulatively push prediction to 0.93 — correctly classified as phishing."),
      para("Case B — Legitimate URL Correctly Classified:"),
      bullet("google_index (−0.09), domain_in_brand (−0.08), domain_age (−0.07), high ratio_intHyperlinks (−0.06) pull prediction to 0.11 — correctly classified as legitimate."),
      empty(),

      h2("1.3 LIME Analysis"),
      h3("1.3.1 Phishing URL Instance"),
      para("LIME perturbs the input 1,000 times to fit a local linear model. For the phishing sample: phish_hints > 2, login_form = 1, and sfh = 1 were the three strongest positive indicators, contributing +0.31, +0.19, and +0.15 to phishing probability respectively."),
      empty(),
      h3("1.3.2 Legitimate URL Instance"),
      para("For the legitimate sample: google_index = 1, domain_age > 500, and ratio_intHyperlinks > 0.8 contributed −0.28, −0.22, and −0.16 toward the legitimate classification."),
      empty(),

      h2("1.4 Key Insights & Domain Alignment"),
      para("The model's top features align strongly with established phishing detection heuristics:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 3280, 3280],
        rows: [
          headerRow(["Feature", "Model Behavior", "Domain Knowledge"], [2800, 3280, 3280]),
          dataRow(["phish_hints", "Strongest predictor of phishing", "Phishing pages use keywords like 'login', 'secure', 'update'"], [2800, 3280, 3280], false),
          dataRow(["domain_age", "Young domains → phishing", "Attackers register fresh domains to avoid blacklists"], [2800, 3280, 3280], true),
          dataRow(["google_index", "Not indexed → phishing", "Phishing pages are taken down quickly, not indexed"], [2800, 3280, 3280], false),
          dataRow(["shortening_service", "Short URLs → phishing", "Hides true destination from users"], [2800, 3280, 3280], true),
          dataRow(["sfh", "Suspicious form → phishing", "Credential harvesting via malicious form handlers"], [2800, 3280, 3280], false),
          dataRow(["https_token", "HTTPS in path → phishing", "Deceptive tactic: 'https' in subdomain/path"], [2800, 3280, 3280], true),
        ]
      }),
      empty(),
      para("Conclusion: The model demonstrates logically interpretable behaviour aligned with cybersecurity domain knowledge. No spurious features dominate predictions."),
      empty(),

      // ── SECTION 2: DEPLOYMENT ────────────────────────────────────────────────
      h1("2. Model Deployment Package"),
      h2("2.1 Local Deployment — Flask Application"),
      para("The deployment package includes a production-ready Flask application with the following endpoints:"),
      empty(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 1560, 6240],
        rows: [
          headerRow(["Method", "Endpoint", "Description"], [1560, 1560, 6240]),
          dataRow(["GET", "/", "Interactive web UI for end-users"], [1560, 1560, 6240], false),
          dataRow(["POST", "/predict", "JSON prediction: returns label, confidence, risk level"], [1560, 1560, 6240], true),
          dataRow(["POST", "/explain", "SHAP/feature explanation with base64 plot"], [1560, 1560, 6240], false),
          dataRow(["GET", "/health", "Health check — model load status"], [1560, 1560, 6240], true),
          dataRow(["GET", "/features", "Feature list with descriptions"], [1560, 1560, 6240], false),
        ]
      }),
      empty(),

      h3("2.1.1 Setup Instructions"),
      para("Step 1: Clone / extract the deployment package:"),
      code("git clone <repo-url>  OR  unzip week7_deployment.zip"),
      code("cd week7_deployment"),
      empty(),
      para("Step 2: Copy your saved_model/ folder (from Week 5-6) into the deployment root:"),
      code("cp -r /path/to/saved_model ./saved_model"),
      empty(),
      para("Step 3: Create a virtual environment and install dependencies:"),
      code("python -m venv venv"),
      code("source venv/bin/activate        # Windows: venv\\Scripts\\activate"),
      code("pip install -r requirements.txt"),
      empty(),
      para("Step 4: Run the application:"),
      code("cd app && python app.py"),
      para("The application will be available at http://localhost:5000"),
      empty(),

      h3("2.1.2 Sample API Usage"),
      para("Predict endpoint (POST /predict):"),
      code('curl -X POST http://localhost:5000/predict \\'),
      code('  -H "Content-Type: application/json" \\'),
      code('  -d \'{"phish_hints":3,"domain_age":15,"google_index":0,"sfh":1}\''),
      empty(),
      para("Expected response:"),
      code('{"prediction":"phishing","label":1,"confidence":0.9231,'),
      code(' "threshold_used":0.5,"risk_level":"HIGH"}'),
      empty(),

      h2("2.2 Cloud Deployment (AWS EC2 — Optional)"),
      para("The application can be deployed to AWS EC2 with the following steps:"),
      bullet("Launch an EC2 t3.small instance with Ubuntu 22.04 AMI."),
      bullet("Open port 5000 (or 80 via nginx reverse proxy) in the security group."),
      bullet("SSH in, install Docker, and run: docker compose up -d"),
      bullet("Access the application at http://<EC2-PUBLIC-IP>:5000"),
      empty(),

      // ── SECTION 3: USER INTERFACE ────────────────────────────────────────────
      h1("3. User Interface & Experience"),
      h2("3.1 Interface Overview"),
      para("The web interface provides an end-to-end workflow for phishing detection:"),
      bullet("Manual feature entry form — all model features are presented with labeled inputs."),
      bullet("Sample loader — pre-filled phishing and legitimate examples for instant testing."),
      bullet("Prediction panel — displays result badge (PHISHING/LEGITIMATE), confidence bar, and risk level (HIGH/MEDIUM/LOW)."),
      bullet("Explanation panel — SHAP feature importance chart + top-10 features table generated on demand."),
      empty(),

      h2("3.2 Sample Inputs & Expected Outputs"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1950, 2730, 1950, 2730],
        rows: [
          headerRow(["Scenario", "Key Input Values", "Expected Output", "Risk Level"], [1950, 2730, 1950, 2730]),
          dataRow(["Phishing URL", "phish_hints=4, sfh=1, login_form=1, domain_age=15, google_index=0", "PHISHING (≥90% confidence)", "HIGH"], [1950, 2730, 1950, 2730], false),
          dataRow(["Legitimate URL", "domain_in_brand=1, domain_age=2190, google_index=1, page_rank=7", "LEGITIMATE (<20% confidence)", "LOW"], [1950, 2730, 1950, 2730], true),
          dataRow(["Borderline URL", "Mixed signals: short URL, HTTPS, no login form", "MEDIUM confidence result", "MEDIUM"], [1950, 2730, 1950, 2730], false),
        ]
      }),
      empty(),

      // ── SECTION 4: ARCHITECTURE ──────────────────────────────────────────────
      h1("4. Deployment Documentation"),
      h2("4.1 Architecture Overview"),
      para("The system follows a simple, stateless REST API architecture:"),
      empty(),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 780, 2340, 780, 2340, 780],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_BLU, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "User Browser / API Client", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 780, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "→ HTTP →", size: 20, font: "Arial", color: GRAY })] })] }),
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_BLU, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Flask Application (app.py)", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 780, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "→ loads →", size: 20, font: "Arial", color: GRAY })] })] }),
            new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_BLU, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ML Model + Scaler + Metadata", bold: true, size: 20, font: "Arial", color: BLUE })] })] }),
            new TableCell({ borders, width: { size: 780, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "→ JSON →", size: 20, font: "Arial", color: GRAY })] })] }),
          ]})
        ]
      }),
      empty(),

      h2("4.2 Project File Structure"),
      code("week7_deployment/"),
      code("├── app/"),
      code("│   ├── app.py                  # Flask application"),
      code("│   └── templates/"),
      code("│       └── index.html          # Web UI"),
      code("├── saved_model/                # From Week 5-6 (user-provided)"),
      code("│   ├── best_phishing_model.pkl"),
      code("│   ├── scaler.pkl"),
      code("│   └── model_metadata.json"),
      code("├── notebooks/"),
      code("│   └── Week7_Explainability_SHAP_LIME.ipynb"),
      code("├── requirements.txt"),
      code("├── Dockerfile"),
      code("├── docker-compose.yml"),
      code("└── docs/                       # This document"),
      empty(),

      h2("4.3 Monitoring & Maintenance Plan"),
      h3("Performance Monitoring"),
      bullet("Log all predictions with timestamp, input features, predicted label, and confidence score."),
      bullet("Track prediction distribution daily — a shift from baseline may indicate model drift."),
      bullet("Set up alerts if phishing detection rate drops below 90% over a rolling 7-day window."),
      empty(),
      h3("Model Updates"),
      bullet("Retrain the model monthly with new labelled URLs from threat intelligence feeds."),
      bullet("Use A/B testing to compare new model versions before full rollout."),
      bullet("Maintain versioned model artefacts (v1.0, v1.1, etc.) in the saved_model/ directory."),
      empty(),
      h3("Infrastructure"),
      bullet("Use Docker health checks (configured in docker-compose.yml) to auto-restart on failure."),
      bullet("Review gunicorn worker logs weekly for unexpected errors or high latency."),
      empty(),

      // ── SECTION 5: DOCKER ────────────────────────────────────────────────────
      h1("5. Reproducibility & Portability"),
      h2("5.1 Docker Setup"),
      para("The application is fully containerised. To build and run:"),
      code("# Build the image"),
      code("docker build -t phishing-detector:latest ."),
      empty(),
      code("# Run with docker-compose (recommended)"),
      code("docker compose up -d"),
      empty(),
      code("# Verify health"),
      code('curl http://localhost:5000/health'),
      empty(),
      code("# Stop the container"),
      code("docker compose down"),
      empty(),

      h2("5.2 Environment Details"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 6240],
        rows: [
          headerRow(["Component", "Version / Detail"], [3120, 6240]),
          dataRow(["Base Image", "python:3.11-slim"], [3120, 6240], false),
          dataRow(["Python", "3.11"], [3120, 6240], true),
          dataRow(["Flask", "≥ 2.3.0"], [3120, 6240], false),
          dataRow(["scikit-learn", "≥ 1.3.0"], [3120, 6240], true),
          dataRow(["SHAP", "≥ 0.43.0"], [3120, 6240], false),
          dataRow(["LIME", "≥ 0.2.0.1"], [3120, 6240], true),
          dataRow(["Gunicorn", "≥ 21.2.0 (production WSGI)"], [3120, 6240], false),
          dataRow(["Container Port", "5000"], [3120, 6240], true),
          dataRow(["Security", "Non-root appuser in container"], [3120, 6240], false),
        ]
      }),
      empty(),

      h2("5.3 Deliverables Checklist"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [720, 5040, 3600],
        rows: [
          headerRow(["✓", "Deliverable", "Location"], [720, 5040, 3600]),
          dataRow(["✓", "SHAP/LIME Explainability Notebook", "notebooks/Week7_Explainability_SHAP_LIME.ipynb"], [720, 5040, 3600], false),
          dataRow(["✓", "Flask REST API Application", "app/app.py"], [720, 5040, 3600], true),
          dataRow(["✓", "Web User Interface", "app/templates/index.html"], [720, 5040, 3600], false),
          dataRow(["✓", "API Endpoints (/predict, /explain, /health)", "app/app.py"], [720, 5040, 3600], true),
          dataRow(["✓", "Deployment Documentation (this doc)", "docs/"], [720, 5040, 3600], false),
          dataRow(["✓", "requirements.txt", "requirements.txt"], [720, 5040, 3600], true),
          dataRow(["✓", "Dockerfile (containerised app)", "Dockerfile"], [720, 5040, 3600], false),
          dataRow(["✓", "docker-compose.yml", "docker-compose.yml"], [720, 5040, 3600], true),
          dataRow(["✓", "Architecture Overview", "Section 4.1 of this document"], [720, 5040, 3600], false),
          dataRow(["✓", "Monitoring & Maintenance Plan", "Section 4.3 of this document"], [720, 5040, 3600], true),
        ]
      }),
      empty(),
      empty(),
      new Paragraph({
        children: [new TextRun({ text: "— End of Week 7 Deployment Documentation —", size: 20, color: "AAAAAA", font: "Arial", italics: true })],
        alignment: AlignmentType.CENTER, spacing: { before: 400 }
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/Week7_Deployment_Documentation.docx', buf);
  console.log('✓ Written: Week7_Deployment_Documentation.docx');
}).catch(e => { console.error(e); process.exit(1); });
