import pandas as pd
from sklearn.linear_model import LinearRegression
from joblib import dump

# Load the CSV
df = pd.read_csv("../data/india.csv")

# Remove commas and convert to numeric
df['Population'] = df['Population'].str.replace(',', '').astype(float)
df['Energy Consumption (MU)'] = df['Energy Consumption (MU)'].str.replace(',', '').astype(float)

# Features and target
X = df[['Population']]
y = df['Energy Consumption (MU)']

# Train the model
model = LinearRegression()
model.fit(X, y)

dump(model, "../model/india.pkl")


print("Intercept:", model.intercept_)
print("Slope:", model.coef_[0])

# Calculate R² score
r2 = model.score(X, y)
print("R² Score:", r2)