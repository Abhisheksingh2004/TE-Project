from flask import Flask, jsonify, request
import pandas as pd
from joblib import load
from flask_cors import CORS
import uuid

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

sessions = {}

# Questions used to verify whether prediction should proceed
VERIFICATION_QUESTIONS = [
    "Does this population use electrical energy? (yes/no)",
    "Is there notable industrial or commercial energy usage in this population? (yes/no)",
]


@app.route('/api/precision/start', methods=['POST'])
def precision_start():
    data = request.get_json() or {}
    population = data.get('population')
    target = data.get('target', 'world')  # 'world' or 'india'

    try:
        population = int(population)
    except Exception:
        return jsonify({"error": "Invalid population value"}), 400

    if population <= 0:
        return jsonify({"error": "Population must be > 0"}), 400

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "population": population,
        "target": target.lower(),
        "step": 0,
    }

    question = VERIFICATION_QUESTIONS[0]
    return jsonify({"session_id": session_id, "question": question})


@app.route('/api/precision/respond', methods=['POST'])
def precision_respond():
    data = request.get_json() or {}
    session_id = data.get('session_id')
    answer = (data.get('answer') or "").strip().lower()

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Invalid or missing session_id"}), 400

    session = sessions[session_id]
    step = session.get('step', 0)

    # interpret yes/no (tolerant)
    positive = answer.startswith('y')

    # If at first step and user says they DO NOT use energy -> prediction is zero
    if step == 0 and not positive:
        # finalize with zero
        sessions.pop(session_id, None)
        return jsonify({
            "done": True,
            "prediction": 0.0,
            "unit": "TWh",
            "reason": "User indicated no energy use; consumption treated as zero."
        })

    # advance step
    session['step'] = step + 1

    # If we've asked all verification questions, compute prediction
    if session['step'] >= len(VERIFICATION_QUESTIONS):
        population = session['population']
        target = session['target']

        if target == 'india':
            X_new = pd.DataFrame({"Population": [population]})
            prediction = india_model.predict(X_new)
            prediction_twh = float(prediction[0]) * 0.001
            result = round(prediction_twh, 2)
        else:
            X_new = pd.DataFrame({"Population": [population]})
            prediction = world_model.predict(X_new)
            result = round(float(prediction[0]), 2)

        sessions.pop(session_id, None)
        return jsonify({
            "done": True,
            "prediction": result,
            "unit": "TWh",
            "reason": "Verification passed; model prediction returned."
        })

    # Otherwise return next question
    next_q = VERIFICATION_QUESTIONS[session['step']]
    return jsonify({"done": False, "question": next_q})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
