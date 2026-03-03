# phishing-website-detection
Machine Learning project to detect phishing websites 


---

## 📐 Architecture Overview

```
User → Browser → Flask App (app.py) → Trained Model (model.pkl) → Prediction → Response
```

| Component | Description |
|-----------|-------------|
| **Frontend** | Bootstrap HTML form (`templates/index.html`) |
| **Backend** | Flask server (`app.py`) |
| **Model** | Gradient Boosting Classifier (43 features, 96.4% accuracy) |
| **Explainability** | SHAP TreeExplainer (`week7_explainability.py`) |

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Rupesh1819/phishing-website-detection.git
cd phishing-website-detection

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt
```

### Run the Flask App

```bash
python app.py
```

Open your browser and navigate to: **http://localhost:5000**

### Run SHAP Explainability

```bash
python week7_explainability.py
```

SHAP plots will be saved in the `reports/` directory.

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| Flask | Web framework for local deployment |
| scikit-learn | Machine learning model |
| shap | Model explainability |
| pandas | Data manipulation |
| numpy | Numerical computations |
| matplotlib | Plotting SHAP visualizations |
| seaborn | Statistical plots |
| joblib | Model serialization |
| jupyter | Notebook support |

---

## 📁 Project Structure

```
phishing-website-detection/
│
├── app.py                      # Flask web application
├── week7_explainability.py     # SHAP explainability script
├── requirements.txt            # Python dependencies
├── README.md                   # This file
│
├── templates/
│   └── index.html              # Web UI (Bootstrap)
│
├── notebooks/
│   ├── saved_model/
│   │   ├── best_phishing_model.pkl   # Trained model
│   │   ├── model_metadata.json       # Model info & feature names
│   │   └── scaler.pkl                # Feature scaler
│   ├── X_test_scaled.csv             # Test features
│   ├── y_test.csv                    # Test labels
│   ├── Week1_*.ipynb                 # Week 1 analysis
│   ├── Week2_*.ipynb                 # Week 2 analysis
│   ├── Week3_*.ipynb                 # Week 3 preprocessing
│   ├── Week4_*.ipynb                 # Week 4 feature engineering
│   └── Week5_6_*.ipynb              # Week 5-6 model development
│
├── reports/
│   ├── shap_summary_plot.png         # SHAP summary (beeswarm)
│   ├── shap_feature_importance.png   # SHAP feature importance (bar)
│   ├── shap_phishing_sample.png      # SHAP explanation (phishing)
│   ├── shap_legitimate_sample.png    # SHAP explanation (legitimate)
│   └── week7_explainability_report.md
│
└── data/
    └── dataset_phishing.csv          # Original dataset
```

---

## 🔍 Model Explainability (Week 7)

SHAP (SHapley Additive exPlanations) is used to explain model predictions:

- **Summary Plot**: Shows overall feature impact direction and magnitude
- **Feature Importance**: Ranks features by average impact on prediction
- **Individual Explanations**: Waterfall plots showing why specific samples are classified as phishing or legitimate

Run `python week7_explainability.py` to generate all plots.

---

## 📊 Monitoring & Maintenance

### Logging
- Log all incoming prediction requests with timestamps
- Store predicted labels and confidence scores for analysis
- Track input feature distributions to detect data drift

### Model Accuracy Monitoring
- Periodically evaluate model on new labeled data
- Track accuracy, precision, recall, and F1-score over time
- Set up alerts if performance drops below acceptable thresholds

### Retraining Strategy
- Schedule periodic retraining (e.g., monthly or quarterly)
- Incorporate newly labeled phishing/legitimate URLs
- Compare retrained model against current production model before deployment

### Model Drift Handling
- Monitor feature distributions for incoming data vs. training data
- Detect concept drift (changing phishing attack patterns)
- Trigger retraining pipeline when drift exceeds defined thresholds
- Maintain versioned model registry for easy rollback

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
