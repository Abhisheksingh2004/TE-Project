import pandas as pd
from joblib import load

# Load model
# model = load("./model/world.pkl")  #For World
model = load("./model/india.pkl")    #For India

# Create input with correct feature name
X_new = pd.DataFrame({"Population": [10000000]})

# Predict
prediction = model.predict(X_new)

# print("Predicted Energy Consumption (MU):", prediction[0])
print("Predicted Energy Consumption (TWh):", prediction[0])
