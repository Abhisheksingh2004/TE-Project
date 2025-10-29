from flask import Flask, jsonify
import pandas as pd
from joblib import load
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

world_model = load("./model/world.pkl")   # For World
india_model = load("./model/india.pkl")   # For India

@app.route('/api/world/<int:num>', methods=['GET'])
def predict_world(num):
    X_new = pd.DataFrame({"Population": [num]})
    prediction = world_model.predict(X_new)
    return jsonify({"Predicted Energy Consumption (TWh)": round(float(prediction[0]),2)})

@app.route('/api/india/<int:num>', methods=['GET'])
def predict_india(num):
    X_new = pd.DataFrame({"Population": [num]})
    prediction = india_model.predict(X_new)
    # Convert MU to TWh (1 MU = 0.001 TWh)
    prediction_twh = float(prediction[0]) * 0.001
    return jsonify({"Predicted Energy Consumption (TWh)": round(prediction_twh, 2)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
