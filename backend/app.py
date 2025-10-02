from flask import Flask, jsonify
import pandas as pd
from joblib import load

app = Flask(__name__)


world_model = load("./model/world.pkl")   # For World
india_model = load("./model/india.pkl")   # For India


@app.route('/api/world/<int:num>', methods=['GET'])
def predict_world(num):
    X_new = pd.DataFrame({"Population": [num]})
    prediction = world_model.predict(X_new)
    return jsonify({"Predicted Energy Consumption (TWh)": float(prediction[0])})

@app.route('/api/india/<int:num>', methods=['GET'])
def predict_india(num):
    X_new = pd.DataFrame({"Population": [num]})
    prediction = india_model.predict(X_new)
    return jsonify({"Predicted Energy Consumption (MU)": float(prediction[0])})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
