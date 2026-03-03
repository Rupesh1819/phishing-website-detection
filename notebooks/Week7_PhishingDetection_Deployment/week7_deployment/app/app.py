"""
Week 7 – Phishing Detection: Flask Deployment Application
=========================================================
Endpoints:
  GET  /            → Web UI
  POST /predict     → JSON prediction
  POST /explain     → SHAP / LIME explanation
  GET  /health      → Health-check
  GET  /features    → Feature list & descriptions
"""

import os, json, pickle, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import io, base64

from flask import Flask, request, jsonify, render_template, send_from_directory
warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
# explicitly use absolute path since Flask worker threads sometimes change cwd
BASE_DIR   = r"C:\Users\RUPESH SHETE\Desktop\IT vedant\phishing-website-detection\notebooks\Week7_PhishingDetection_Deployment\week7_deployment\app"
MODEL_DIR  = os.path.join(BASE_DIR, "saved_model")
MODEL_PATH = os.path.join(MODEL_DIR, "best_phishing_model.pkl")
SCALER_PATH= os.path.join(MODEL_DIR, "scaler.pkl")
META_PATH  = os.path.join(MODEL_DIR, "model_metadata.json")

app = Flask(__name__, template_folder="templates", static_folder="static")

# ── Load artefacts at startup ─────────────────────────────────────────────────
def load_artifacts():
    print("Loading artifacts...")
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"MODEL_DIR exists: {os.path.exists(MODEL_DIR)}")
    print(f"MODEL_PATH exists: {os.path.exists(MODEL_PATH)}")
    
    model, scaler, meta = None, None, {}
    
    if os.path.exists(MODEL_PATH):
        try:
            with open(MODEL_PATH, "rb") as f:
                model = pickle.load(f)
            print("Model loaded successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")
            
    if os.path.exists(SCALER_PATH):
        try:
            with open(SCALER_PATH, "rb") as f:
                scaler = pickle.load(f)
            print("Scaler loaded successfully.")
        except Exception as e:
            print(f"Error loading scaler: {e}")
            
    if os.path.exists(META_PATH):
        try:
            with open(META_PATH) as f:
                meta = json.load(f)
            print(f"Meta loaded, {len(meta.get('feature_names', []))} features.")
        except Exception as e:
            print(f"Error loading meta: {e}")
            
    return model, scaler, meta

MODEL, SCALER, META = load_artifacts()
FEATURE_NAMES = META.get("feature_names", [])
SCALE_NEEDED  = META.get("scale_needed", False)

# ── Helper: preprocess input ──────────────────────────────────────────────────
def preprocess(data: dict) -> np.ndarray:
    """Convert JSON dict → feature array, aligned to training columns."""
    row = {f: data.get(f, 0) for f in FEATURE_NAMES}
    X   = pd.DataFrame([row])[FEATURE_NAMES].astype(float)
    if SCALE_NEEDED and SCALER is not None:
        X = SCALER.transform(X)
    return np.array(X)

def make_shap_plot(X_input: np.ndarray, feature_names: list) -> str:
    """Return base64 PNG of a SHAP waterfall-style bar chart (fallback if shap not installed)."""
    try:
        import shap
        explainer = shap.TreeExplainer(MODEL)
        shap_vals  = explainer.shap_values(X_input)
        # For binary classifiers shap_values may be a list
        sv = shap_vals[1][0] if isinstance(shap_vals, list) else shap_vals[0]
        importance = dict(zip(feature_names, sv))
    except Exception:
        # Fallback: use feature importances if available
        if hasattr(MODEL, "feature_importances_"):
            importance = dict(zip(feature_names, MODEL.feature_importances_))
        else:
            importance = {f: 0 for f in feature_names}

    # Plot top-20
    sorted_imp = sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True)[:20]
    feats  = [x[0] for x in sorted_imp]
    values = [x[1] for x in sorted_imp]
    colors = ["#e74c3c" if v > 0 else "#2ecc71" for v in values]

    fig, ax = plt.subplots(figsize=(10, 7))
    bars = ax.barh(feats[::-1], values[::-1], color=colors[::-1], edgecolor="white", linewidth=0.5)
    ax.axvline(0, color="black", linewidth=0.8)
    ax.set_xlabel("SHAP value / Feature importance", fontsize=11)
    ax.set_title("Feature Impact on Prediction", fontsize=13, fontweight="bold")
    ax.spines[["top","right"]].set_visible(False)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=120)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html",
                           feature_names=FEATURE_NAMES,
                           model_name=META.get("model_name", "Unknown"),
                           model_metrics=META.get("test_metrics", {}))

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": MODEL is not None,
        "model_name": META.get("model_name", "N/A"),
        "features": len(FEATURE_NAMES)
    })

@app.route("/features")
def features():
    descriptions = {
        "length_url": "Total URL character count",
        "length_hostname": "Hostname character count",
        "nb_dots": "Number of dots in the URL",
        "nb_hyphens": "Number of hyphens",
        "nb_at": "Number of @ symbols",
        "nb_qm": "Number of question marks",
        "nb_and": "Number of ampersands",
        "nb_or": "Number of OR operators",
        "nb_eq": "Number of equal signs",
        "nb_underscore": "Number of underscores",
        "nb_tilde": "Number of tilde characters",
        "nb_percent": "Number of percent signs",
        "nb_slash": "Number of slashes",
        "nb_star": "Number of asterisks",
        "nb_colon": "Number of colons",
        "nb_comma": "Number of commas",
        "nb_semicolumn": "Number of semicolons",
        "nb_dollar": "Number of dollar signs",
        "nb_space": "Number of spaces",
        "nb_www": "Number of 'www' occurrences",
        "nb_com": "Number of '.com' occurrences",
        "nb_dslash": "Number of '//' occurrences",
        "http_in_path": "HTTP appears in path (1/0)",
        "https_token": "HTTPS token present (1/0)",
        "ratio_digits_url": "Ratio of digits in URL",
        "ratio_digits_host": "Ratio of digits in hostname",
        "punycode": "Punycode encoding detected (1/0)",
        "port": "Non-standard port present (1/0)",
        "tld_in_path": "TLD found in path (1/0)",
        "tld_in_subdomain": "TLD found in subdomain (1/0)",
        "abnormal_subdomain": "Abnormal subdomain pattern (1/0)",
        "nb_subdomains": "Number of subdomains",
        "prefix_suffix": "Prefix/suffix dash in domain (1/0)",
        "shortening_service": "URL shortening service used (1/0)",
        "path_extension": "Suspicious file extension (1/0)",
        "nb_redirection": "Number of redirections",
        "nb_external_redirection": "External redirections",
        "length_words_raw": "Total words in raw URL",
        "char_repeat": "Repeated character count",
        "shortest_words_raw": "Shortest word length",
        "shortest_word_host": "Shortest word in hostname",
        "shortest_word_path": "Shortest word in path",
        "longest_words_raw": "Longest word length",
        "longest_word_host": "Longest word in hostname",
        "longest_word_path": "Longest word in path",
        "avg_words_raw": "Average word length",
        "avg_word_host": "Average word length in hostname",
        "avg_word_path": "Average word length in path",
        "phish_hints": "Phishing keywords count",
        "domain_in_brand": "Domain matches known brand (1/0)",
        "brand_in_subdomain": "Brand keyword in subdomain (1/0)",
        "brand_in_path": "Brand keyword in path (1/0)",
        "suspecious_tld": "Suspicious TLD (1/0)",
        "statistical_report": "IP in statistical report (1/0)",
        "nb_hyperlinks": "Number of hyperlinks on page",
        "ratio_intHyperlinks": "Ratio of internal hyperlinks",
        "ratio_extHyperlinks": "Ratio of external hyperlinks",
        "ratio_nullHyperlinks": "Ratio of null hyperlinks",
        "nb_extCSS": "External CSS count",
        "ratio_intRedirection": "Internal redirection ratio",
        "ratio_extRedirection": "External redirection ratio",
        "ratio_intErrors": "Internal error ratio",
        "ratio_extErrors": "External error ratio",
        "login_form": "Login form present (1/0)",
        "external_favicon": "External favicon (1/0)",
        "links_in_tags": "Links in meta/script/link tags",
        "submit_email": "Submit-to-email action (1/0)",
        "ratio_intMedia": "Internal media ratio",
        "ratio_extMedia": "External media ratio",
        "sfh": "Server form handler suspicious (1/0)",
        "iframe": "IFrame present (1/0)",
        "popup_window": "Pop-up window (1/0)",
        "safe_anchor": "Safe anchor ratio",
        "onmouseover": "onmouseover event (1/0)",
        "right_clic": "Right-click disabled (1/0)",
        "empty_title": "Empty page title (1/0)",
        "domain_in_title": "Domain reflected in title (1/0)",
        "domain_with_copyright": "Copyright mentions domain (1/0)",
        "whois_registered_domain": "Domain registered in WHOIS (1/0)",
        "domain_registration_length": "Domain registration length (days)",
        "domain_age": "Domain age (days)",
        "web_traffic": "Web traffic rank",
        "dns_record": "DNS record exists (1/0)",
        "google_index": "Indexed by Google (1/0)",
        "page_rank": "PageRank score",
    }
    return jsonify({
        "features": [
            {"name": f, "description": descriptions.get(f, f)}
            for f in FEATURE_NAMES
        ]
    })

@app.route("/predict", methods=["POST"])
def predict():
    if MODEL is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(force=True)
    try:
        X = preprocess(data)
        prob  = float(MODEL.predict_proba(X)[0][1]) if hasattr(MODEL, "predict_proba") else None
        label = int(MODEL.predict(X)[0])
        threshold = META.get("optimal_threshold", 0.5)
        final_label = 1 if (prob is not None and prob >= threshold) else label

        return jsonify({
            "prediction": "phishing" if final_label == 1 else "legitimate",
            "label": final_label,
            "confidence": round(prob, 4) if prob is not None else None,
            "threshold_used": threshold,
            "risk_level": (
                "HIGH"   if prob and prob >= 0.75 else
                "MEDIUM" if prob and prob >= threshold else
                "LOW"
            )
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/explain", methods=["POST"])
def explain():
    if MODEL is None:
        return jsonify({"error": "Model not loaded"}), 503

    data = request.get_json(force=True)
    try:
        X = preprocess(data)
        plot_b64 = make_shap_plot(X, FEATURE_NAMES)

        # Feature contributions (simple diff from mean)
        if hasattr(MODEL, "feature_importances_"):
            fi = dict(zip(FEATURE_NAMES, MODEL.feature_importances_))
            top_features = sorted(fi.items(), key=lambda x: x[1], reverse=True)[:10]
        else:
            top_features = []

        return jsonify({
            "shap_plot_base64": plot_b64,
            "top_features": [{"feature": k, "importance": round(v, 5)} for k, v in top_features],
            "explanation": "Red bars indicate features pushing toward PHISHING; green toward LEGITIMATE."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
