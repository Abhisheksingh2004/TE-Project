import pandas as pd
import matplotlib.pyplot as plt
import os

# Load dataset
df = pd.read_csv("../data/india.csv")

# Clean columns
df.columns = df.columns.str.strip()
df.rename(columns={"Energy Consumption (MU)": "Energy_Consumption_MU"}, inplace=True)

# Convert numeric columns
df["Population"] = df["Population"].astype(str).str.replace(",", "").astype(float)
df["Energy_Consumption_MU"] = df["Energy_Consumption_MU"].astype(str).str.replace(",", "").astype(float)

# Aggregate year-wise totals
yearly_data = df.groupby("Year")[["Population", "Energy_Consumption_MU"]].sum().reset_index()

# Ensure output directory
os.makedirs("output_images", exist_ok=True)

# --- Plot 1: Population trend ---
plt.figure(figsize=(8, 5))
plt.plot(yearly_data["Year"], yearly_data["Population"], color="blue", marker="o", linewidth=2)
plt.title("India — Population Growth Over Years")
plt.xlabel("Year")
plt.ylabel("Population")
plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.savefig("output_images/population_trend.png", dpi=300, bbox_inches="tight")
plt.show()

# --- Plot 2: Energy consumption trend ---
plt.figure(figsize=(8, 5))
plt.plot(yearly_data["Year"], yearly_data["Energy_Consumption_MU"], color="green", marker="x", linewidth=2)
plt.title("India — Energy Consumption Over Years")
plt.xlabel("Year")
plt.ylabel("Energy Consumption (MU)")
plt.grid(True, linestyle="--", alpha=0.6)
plt.tight_layout()
plt.savefig("output_images/energy_trend.png", dpi=300, bbox_inches="tight")
plt.show()

print("Graphs saved in 'output_images' folder.")
