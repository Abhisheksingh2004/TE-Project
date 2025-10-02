import pandas as pd
from sklearn.linear_model import LinearRegression
from joblib import dump

# Load the CSV
df = pd.read_csv("../data/world.csv")   # <-- change filename if needed

# Remove commas and convert to numeric
df['Population'] = df['Population'].astype(str).str.replace(',', '').astype(float)
df['Electricity Consumption (TWh)'] = df['Electricity Consumption (TWh)'].astype(str).str.replace(',', '').astype(float)

# Features and target
X = df[['Population']]
y = df['Electricity Consumption (TWh)']

# Train the model
model = LinearRegression()
model.fit(X, y)

# Save model
dump(model, "../model/world.pkl")

# Print model parameters
print("Intercept:", model.intercept_)
print("Slope:", model.coef_[0])

# Calculate R² score
r2 = model.score(X, y)
print("R² Score:", r2)
